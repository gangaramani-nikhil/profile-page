import type { ProfileLink } from '../../data/profile';

/**
 * Renders a link — unless it's dead. Missing/`#` hrefs never become clickable
 * buttons; they render as inert terminal text in the --ghost token so the OS
 * illusion holds ([STATUS: OFFLINE], [WIP], …).
 */
export function GhostLink({
  link,
  className = '',
}: {
  link: ProfileLink;
  className?: string;
}) {
  const dead = !link.href || link.href === '#';
  if (dead) {
    return (
      <span className={`ghost-token text-xs ${className}`}>
        {link.label}: {link.offlineToken ?? '[STATUS: OFFLINE]'}
      </span>
    );
  }
  return (
    <a
      href={link.href!}
      target={link.href!.startsWith('mailto:') ? undefined : '_blank'}
      rel="noreferrer"
      className={`text-xs text-cyan underline decoration-cyan/40 underline-offset-4 transition-colors hover:text-neon hover:decoration-neon/60 ${className}`}
    >
      {link.label}
    </a>
  );
}
