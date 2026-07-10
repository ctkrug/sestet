"use client";

import type { WallEntry } from "@/lib/wall";
import { EntryCard } from "./EntryCard";
import styles from "./Wall.module.css";

export type SortMode = "new" | "top";

interface WallProps {
  entries: WallEntry[];
  sort: SortMode;
  now: number;
  announcement: string;
  onSortChange: (sort: SortMode) => void;
  onVote: (entryId: string) => void;
}

export function Wall({ entries, sort, now, announcement, onSortChange, onVote }: WallProps) {
  return (
    <section className={styles.section} aria-label="The live wall">
      <div className={styles.header}>
        <h2 className={styles.heading}>The wall</h2>
        <div className={styles.sortGroup} role="group" aria-label="Sort the wall">
          <button
            type="button"
            className={styles.sortButton}
            data-active={sort === "new"}
            aria-pressed={sort === "new"}
            onClick={() => onSortChange("new")}
          >
            New
          </button>
          <button
            type="button"
            className={styles.sortButton}
            data-active={sort === "top"}
            aria-pressed={sort === "top"}
            onClick={() => onSortChange("top")}
          >
            Top
          </button>
        </div>
      </div>

      <div className={styles.srOnly} aria-live="polite">
        {announcement}
      </div>

      {entries.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No stories yet</p>
          <p>Be the first to write six words against today&rsquo;s prompt.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} now={now} onVote={onVote} />
          ))}
        </ul>
      )}
    </section>
  );
}
