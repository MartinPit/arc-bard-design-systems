import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Check, Code2, Copy } from 'lucide-react';
import { getSpecimenSourceId, useShowcaseUrlState } from '../showcaseUrlState';
import { ProtectedText } from './ProtectedText';

export function Specimen({
  title,
  description,
  code,
  children,
  align = 'start',
}: {
  title: string;
  description: string;
  code: string;
  children: ReactNode;
  align?: 'start' | 'center';
}) {
  const sourceId = getSpecimenSourceId(title);
  const { sources, setSourceOpen } = useShowcaseUrlState();
  const sourceOpen = sources.includes(sourceId);
  return (
    <article className="arc-specimen">
      <header className="arc-specimen__header">
        <div>
          <p className="arc-specimen__index" aria-hidden="true">FIG.</p>
          <h3>{title}</h3>
        </div>
        <Code2 size={19} aria-hidden="true" />
      </header>
      <p className="arc-specimen__description">{description}</p>
      <div className={`arc-specimen__preview arc-specimen__preview--${align}`}>
        <span className="arc-specimen__cross arc-specimen__cross--one" aria-hidden="true">+</span>
        <span className="arc-specimen__cross arc-specimen__cross--two" aria-hidden="true">+</span>
        {children}
      </div>
      <details
        className="arc-code"
        open={sourceOpen}
        onToggle={(event) => {
          if (event.currentTarget.open !== sourceOpen) setSourceOpen(sourceId, event.currentTarget.open);
        }}
      >
        <summary>
          <span><Code2 size={15} aria-hidden="true" /> <ProtectedText>React</ProtectedText> Example</span>
          <span className="arc-code__action">View Source</span>
        </summary>
        <pre tabIndex={0}><code translate="no" className="notranslate">{code}</code></pre>
      </details>
    </article>
  );
}

export function CopyToken({ value, label }: { value: string; label: string }) {
  const [outcome, setOutcome] = useState<'idle' | 'success' | 'failure'>('idle');
  const resetTimer = useRef<number | undefined>(undefined);
  const statusId = useId();

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  async function copy() {
    window.clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(value);
      setOutcome('success');
      resetTimer.current = window.setTimeout(() => setOutcome('idle'), 1600);
    } catch {
      setOutcome('failure');
    }
  }

  return (
    <div className="arc-copy-token-control">
      <button
        type="button"
        className="arc-copy-token"
        onClick={copy}
        aria-label={`Copy ${label} token ${value}`}
        aria-describedby={statusId}
      >
        {outcome === 'success' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        <span>{outcome === 'success' ? 'Copied' : <ProtectedText>{value}</ProtectedText>}</span>
      </button>
      <span
        className={`arc-copy-token__status${outcome === 'failure' ? ' arc-copy-token__status--error' : ''}`}
        id={statusId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {outcome === 'success' && <>Copied <ProtectedText>{value}</ProtectedText> to the clipboard.</>}
        {outcome === 'failure' && <>Couldn’t copy <ProtectedText>{value}</ProtectedText>. Copy the value manually.</>}
      </span>
    </div>
  );
}
