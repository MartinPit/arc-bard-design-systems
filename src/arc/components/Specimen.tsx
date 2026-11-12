import { useState, type ReactNode } from 'react';
import { Check, Code2, Copy } from 'lucide-react';

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
      <details className="arc-code">
        <summary>
          <span><Code2 size={15} aria-hidden="true" /> React example</span>
          <span className="arc-code__action">View source</span>
        </summary>
        <pre tabIndex={0}><code>{code}</code></pre>
      </details>
    </article>
  );
}

export function CopyToken({ value, label }: { value: string; label: string }) {
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
    <button type="button" className="arc-copy-token" onClick={copy} aria-label={`Copy ${label} token ${value}`}>
      {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      <span>{copied ? 'Copied' : value}</span>
    </button>
  );
}
