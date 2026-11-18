import type { ReactNode } from 'react';

export function ProtectedText({ children }: { children: ReactNode }) {
  return <span translate="no" className="notranslate" data-protected-text>{children}</span>;
}
