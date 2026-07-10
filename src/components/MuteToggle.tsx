"use client";

import styles from "./MuteToggle.module.css";

interface MuteToggleProps {
  muted: boolean;
  onToggle: () => void;
}

export function MuteToggle({ muted, onToggle }: MuteToggleProps) {
  return (
    <button
      type="button"
      className={styles.button}
      data-muted={muted}
      onClick={onToggle}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      aria-pressed={muted}
    >
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="currentColor" />
          <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="currentColor" />
          <path
            d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
