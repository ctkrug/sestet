"use client";

import { useState } from "react";
import { timeAgo } from "@/lib/format";
import type { WallEntry } from "@/lib/wall";
import styles from "./EntryCard.module.css";

interface EntryCardProps {
  entry: WallEntry;
  now: number;
  onVote: (entryId: string) => void;
}

export function EntryCard({ entry, now, onVote }: EntryCardProps) {
  const [shakeNonce, setShakeNonce] = useState(0);

  function handleVoteClick() {
    if (entry.votedByMe) {
      setShakeNonce((n) => n + 1);
      return;
    }
    onVote(entry.id);
  }

  return (
    <li className={styles.card} data-arriving={entry.justArrived} data-mine={entry.isMine}>
      <p className={styles.body}>{entry.body}</p>
      <div className={styles.meta}>
        {entry.isMine ? <span className={styles.badge}>Yours</span> : null}
        <span className={styles.time}>{timeAgo(entry.createdAt, now)}</span>
        <button
          type="button"
          className={styles.voteButton}
          data-voted={entry.votedByMe}
          onClick={handleVoteClick}
          aria-label={entry.votedByMe ? `Voted, ${entry.voteCount} votes` : `Upvote, ${entry.voteCount} votes`}
          aria-pressed={entry.votedByMe}
        >
          <ArrowIcon filled={entry.votedByMe} />
          {shakeNonce > 0 ? (
            <span key={shakeNonce} className={styles.shake}>
              <span key={entry.voteCount} className={`${styles.voteCount} ${styles.pop}`}>
                {entry.voteCount}
              </span>
            </span>
          ) : (
            <span key={entry.voteCount} className={`${styles.voteCount} ${styles.pop}`}>
              {entry.voteCount}
            </span>
          )}
        </button>
      </div>
    </li>
  );
}

function ArrowIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4l8 9h-5v7h-6v-7H4l8-9Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
