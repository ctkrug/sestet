// Coarse relative-time labels for entry metadata. Deliberately coarse
// (minute resolution and up) since the wall polls every few seconds and a
// precise "3s ago" would just flicker.
export function timeAgo(createdAt: number, now: number): string {
  const diffMs = Math.max(0, now - createdAt);
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
