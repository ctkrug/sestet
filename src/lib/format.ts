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

const ARCHIVE_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

// Renders a prompt id (a UTC "YYYY-MM-DD" date key) as a human-readable
// archive label. Parses as UTC explicitly so the displayed day never shifts
// with the reader's local timezone.
export function formatArchiveDate(dateKey: string): string {
  return ARCHIVE_DATE_FORMATTER.format(new Date(`${dateKey}T00:00:00Z`));
}
