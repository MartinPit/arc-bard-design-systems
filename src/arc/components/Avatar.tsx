import { join } from './shared';
import './Avatar.css';

export interface AvatarProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
  marked?: boolean;
}

export function Avatar({ name, size = 'medium', marked = false }: AvatarProps) {
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className={join('arc-avatar', `arc-avatar--${size}`)} role="img" aria-label={marked ? `${name}, available` : name}>
      <span aria-hidden="true">{initials}</span>
      {marked && <span className="arc-avatar__mark" aria-hidden="true" />}
    </span>
  );
}
