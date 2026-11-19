import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, Home, Repeat2, Undo2, X } from 'lucide-react';
import { Button } from '../components';
import { formatNumber } from '../intl';
import { reducePractice, type PracticeAction } from './practice';
import { ContentStack } from './ui';
import type { PracticeSession } from './types';

interface PracticeSessionViewProps {
  session: PracticeSession;
  onChange: (session: PracticeSession) => void;
  onSuspend: () => void;
  onFinish: () => void;
}

function isEditable(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
}

export function PracticeSessionView({ session, onChange, onSuspend, onFinish }: PracticeSessionViewProps) {
  const current = session.batch[session.currentIndex] ?? null;

  function dispatch(action: PracticeAction) {
    onChange(reducePractice(session, action));
  }

  const undoControl = session.lastRating ? (
    <Button variant="quiet" className="fc-undo-rating" onClick={() => dispatch('undo')}><Undo2 size={16} aria-hidden="true" />Undo last rating<span className="fc-key-hint" aria-hidden="true">U</span></Button>
  ) : null;

  useEffect(() => {
    function shortcuts(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || isEditable(event.target) || document.querySelector('[role="dialog"]')) return;
      if (event.key.toLowerCase() === 'u' && session.lastRating) {
        event.preventDefault();
        dispatch('undo');
      } else if (event.code === 'Space' && session.phase === 'card' && !session.revealed) {
        event.preventDefault();
        dispatch('reveal');
      } else if (event.key === 'ArrowLeft' && session.phase === 'card' && !session.earlyUnknown) {
        event.preventDefault();
        dispatch('unknown');
      } else if (event.key === 'ArrowRight') {
        if (session.phase === 'checkpoint' || (session.phase === 'card' && session.earlyUnknown)) {
          event.preventDefault();
          dispatch('continue');
        } else if (session.phase === 'card' && !session.earlyUnknown) {
          event.preventDefault();
          dispatch('known');
        }
      }
    }
    window.addEventListener('keydown', shortcuts);
    return () => window.removeEventListener('keydown', shortcuts);
  });

  return (
    <div className="fc-session">
      <header className="fc-session__topline">
        <div><h1 dir="auto">{session.title}</h1></div>
        <Button variant="quiet" onClick={onSuspend}><Home size={16} aria-hidden="true" />Save & suspend</Button>
      </header>

      <div className="fc-session__layout">
        <section className="fc-session__main" aria-live="polite" aria-atomic="false">
          {session.phase === 'card' && current && (
            <>
              <div className="fc-session__batch-line"><span>Card {formatNumber(session.currentIndex + 1)} of {formatNumber(session.batch.length)} in this batch</span><span>{formatNumber(session.carry.length)} waiting to repeat next</span>{undoControl}</div>
              <article className={`fc-practice-card${session.revealed ? ' is-revealed' : ''}${session.earlyUnknown ? ' is-early-unknown' : ''}`} aria-label={`Practice card from ${current.setName}`}>
                <div className="fc-practice-card__registration"><span dir="auto">{current.setName}</span><span>{session.revealed ? 'ANSWER OPEN' : 'RECALL'}</span></div>
                <section className="fc-practice-card__front" aria-label="Front"><ContentStack values={current.front} /></section>
                {session.revealed && <section className="fc-practice-card__back" aria-label="Back"><span className="fc-practice-card__divider" aria-hidden="true">✦</span><ContentStack values={current.back} /></section>}
                {session.earlyUnknown && <p className="fc-early-note" role="status"><Repeat2 size={17} aria-hidden="true" />Marked for the next batch. Read the answer, then choose Continue.</p>}
              </article>

              <div className="fc-session-controls" aria-label="Practice actions">
                {!session.earlyUnknown ? (
                  <>
                    <Button variant="secondary" onClick={() => dispatch('unknown')}><X size={18} aria-hidden="true" />Don’t know<span className="fc-key-hint" aria-hidden="true">←</span></Button>
                    {!session.revealed && <Button variant="secondary" onClick={() => dispatch('reveal')}><Eye size={18} aria-hidden="true" />Show answer<span className="fc-key-hint" aria-hidden="true">Space</span></Button>}
                    <Button onClick={() => dispatch('known')}><Check size={18} aria-hidden="true" />Known<span className="fc-key-hint" aria-hidden="true">→</span></Button>
                  </>
                ) : <Button onClick={() => dispatch('continue')}>Continue<ArrowRight size={18} aria-hidden="true" /><span className="fc-key-hint" aria-hidden="true">→</span></Button>}
              </div>
              <p className="fc-session__instruction">{session.earlyUnknown ? 'Continue when you’re ready; this card returns in the next batch.' : session.revealed ? 'Rate honestly. Unknown cards return in the next batch.' : 'Recall the answer, reveal it, or rate early. Early Known advances immediately.'}</p>
            </>
          )}

          {session.phase === 'checkpoint' && (
            <section className="fc-checkpoint" aria-labelledby="checkpoint-heading">
              <h2 id="checkpoint-heading">A small checkpoint.</h2>
              <p>Known cards leave this session. Repeated cards enter the next batch before any unseen cards fill the remaining spaces.</p>
              <dl><div><dt><Check size={18} aria-hidden="true" />Known this batch</dt><dd>{formatNumber(session.batchKnown)}</dd></div><div><dt><Repeat2 size={18} aria-hidden="true" />Repeat this batch</dt><dd>{formatNumber(session.batchRepeated)}</dd></div></dl>
              <div className="fc-next-batch"><span>Next batch</span><strong>{formatNumber(Math.min(10, session.carry.length + session.pending.length))}</strong><p>{formatNumber(session.carry.length)} repeated + {formatNumber(Math.min(Math.max(0, 10 - session.carry.length), session.pending.length))} unseen{!session.carry.length && !session.pending.length ? ' · this was the final batch' : ''}</p></div>
              {undoControl}
              <Button onClick={() => dispatch('continue')}>{session.carry.length || session.pending.length ? 'Continue to next batch' : 'View final summary'}<ArrowRight size={18} aria-hidden="true" /></Button>
            </section>
          )}

          {session.phase === 'complete' && (
            <section className="fc-complete" aria-labelledby="complete-heading">
              <h2 id="complete-heading">Every eligible card is known.</h2>
              <p>This was one practice session, not a history entry. Your library is unchanged.</p>
              {undoControl}
              <Button onClick={onFinish}>Finish session<ArrowRight size={18} aria-hidden="true" /></Button>
            </section>
          )}
        </section>

        <aside className="fc-session-ledger" aria-label="Current practice summary">
          <p className="fc-eyebrow">{session.phase === 'complete' ? 'Final summary' : 'Current summary'}</p>
          <dl><div><dt>Known</dt><dd>{formatNumber(session.known)}</dd></div><div><dt>Repeated</dt><dd>{formatNumber(session.repeated)}</dd></div><div><dt>Skipped at setup</dt><dd>{formatNumber(session.skipped)}</dd></div><div><dt>Unseen waiting</dt><dd>{formatNumber(session.pending.length)}</dd></div></dl>
          <div className="fc-session-progress"><span>{formatNumber(session.known)} of {formatNumber(session.total)} cards known</span><progress max={Math.max(1, session.total)} value={session.known} aria-label="Known practice cards" /></div>
          <div className="fc-session-keyboard"><h2>Keyboard</h2><p><kbd>Space</kbd> reveal</p><p><kbd><ArrowLeft size={13} aria-hidden="true" /></kbd> Don’t know</p><p><kbd><ArrowRight size={13} aria-hidden="true" /></kbd> Known or Continue</p>{session.lastRating && <p><kbd>U</kbd> Undo last rating</p>}<small>Shortcuts pause while you type in a control.</small></div>
        </aside>
      </div>
    </div>
  );
}
