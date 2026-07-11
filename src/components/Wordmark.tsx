import styles from "./Wordmark.module.css";

export function Wordmark() {
  return (
    <span className={styles.wordmark}>
      Sestet<span className={styles.dot} aria-hidden="true" />
    </span>
  );
}
