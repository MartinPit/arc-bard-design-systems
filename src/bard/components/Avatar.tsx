import './Avatar.css';

export type AvatarProps = { initials: string; label: string; status?: boolean; tone?: 'mint' | 'lilac' | 'aqua' };

export function Avatar({ initials, label, status = false, tone = 'mint' }: AvatarProps) {
  return <span className={`bard-avatar bard-avatar--${tone}`} role="img" aria-label={label}><span>{initials}</span>{status && <i title="Available" />}</span>;
}
