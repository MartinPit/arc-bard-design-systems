import { useState, type ReactNode } from 'react';
import { Check, Code2, Copy } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

const sectionIds: Record<string, string> = {
  '01': 'identity-title',
  '02': 'color-title',
  '03': 'typography-title',
  '04': 'form-title',
  '05': 'motion-title',
  '06': 'components-title',
  '07': 'composition-title',
  '08': 'usage-title',
  '09': 'accessibility-title',
};

export function SectionHeader({ number, eyebrow, title, description }: { number: string; eyebrow: string; title: string; description: string }) {
  return (
    <header className="bard-section-header">
      <div className="bard-section-header__number" aria-hidden="true">{number}</div>
      <div>
        <p className="bard-eyebrow">{eyebrow}</p>
        <h2 id={sectionIds[number]}>{title}</h2>
        <p className="bard-section-header__description">{description}</p>
      </div>
    </header>
  );
}

export function Specimen({ title, description, code, children, wide = false }: { title: string; description: string; code: string; children: ReactNode; wide?: boolean }) {
  return (
    <article className={`bard-specimen${wide ? ' bard-specimen--wide' : ''}`}>
      <header className="bard-specimen__header">
        <div><h3>{title}</h3><p>{description}</p></div>
        <span className="bard-specimen__index" aria-hidden="true">{title.slice(0, 2).toUpperCase()}</span>
      </header>
      <div className="bard-specimen__stage">{children}</div>
      <details className="bard-code">
        <summary><Code2 size={15} aria-hidden="true" /><span>React code</span></summary>
        <pre><code>{code}</code></pre>
      </details>
    </article>
  );
}

export function CopyButton({ value, label = 'Copy value' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button type="button" className="bard-copy" onClick={copy} aria-label={`${label}: ${value}`}>
      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      <span>{copied ? 'Copied' : value}</span>
    </button>
  );
}

export function Reveal({ children, className = '', wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={`${className}${wide ? `${className ? ' ' : ''}bard-reveal--wide` : ''}`}
      initial={reduceMotion ? false : { opacity: 0, y: 28, clipPath: 'inset(0 0 18% 0)' }}
      whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
