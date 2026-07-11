import type { Entry, Prompt } from "@/types";

export async function getOrCreatePrompt(db: D1Database, dateKey: string, text: string): Promise<Prompt> {
  const existing = await getPromptById(db, dateKey);
  if (existing) return existing;

  const createdAt = Date.now();
  await db
    .prepare("INSERT OR IGNORE INTO prompts (id, text, created_at) VALUES (?, ?, ?)")
    .bind(dateKey, text, createdAt)
    .run();

  return { id: dateKey, text, createdAt };
}

export async function getPromptById(db: D1Database, id: string): Promise<Prompt | null> {
  return db
    .prepare("SELECT id, text, created_at as createdAt FROM prompts WHERE id = ?")
    .bind(id)
    .first<Prompt>();
}

type StoredEntry = Omit<Entry, "votedByMe" | "isMine"> & { authorToken: string };

export async function listEntries(
  db: D1Database,
  promptId: string,
  sort: "new" | "top",
  limit = 100,
): Promise<StoredEntry[]> {
  const orderBy = sort === "top" ? "vote_count DESC, created_at DESC" : "created_at DESC";
  const { results } = await db
    .prepare(
      `SELECT id, prompt_id as promptId, body, vote_count as voteCount, created_at as createdAt,
              author_token as authorToken
       FROM entries WHERE prompt_id = ? ORDER BY ${orderBy} LIMIT ?`,
    )
    .bind(promptId, limit)
    .all<StoredEntry>();
  return results;
}

// Returns false (no-op) instead of throwing when the unique
// (prompt_id, author_token) index rejects a duplicate submission, so the
// route can turn a lost race into a clean 409 rather than a 500.
export async function insertEntry(
  db: D1Database,
  entry: { id: string; promptId: string; body: string; authorToken: string; createdAt: number },
): Promise<boolean> {
  const { meta } = await db
    .prepare(
      "INSERT OR IGNORE INTO entries (id, prompt_id, body, author_token, vote_count, created_at) VALUES (?, ?, ?, ?, 0, ?)",
    )
    .bind(entry.id, entry.promptId, entry.body, entry.authorToken, entry.createdAt)
    .run();
  return meta.changes > 0;
}

export async function hasSubmittedToday(db: D1Database, promptId: string, authorToken: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT 1 FROM entries WHERE prompt_id = ? AND author_token = ? LIMIT 1")
    .bind(promptId, authorToken)
    .first();
  return row !== null;
}

export async function getVotedEntryIds(
  db: D1Database,
  entryIds: readonly string[],
  voterToken: string,
): Promise<Set<string>> {
  if (entryIds.length === 0) return new Set();
  const placeholders = entryIds.map(() => "?").join(", ");
  const { results } = await db
    .prepare(`SELECT entry_id as entryId FROM votes WHERE voter_token = ? AND entry_id IN (${placeholders})`)
    .bind(voterToken, ...entryIds)
    .all<{ entryId: string }>();
  return new Set(results.map((row) => row.entryId));
}

export async function castVote(
  db: D1Database,
  entryId: string,
  voterToken: string,
): Promise<{ voteCount: number; alreadyVoted: boolean }> {
  const existing = await db
    .prepare("SELECT 1 FROM votes WHERE entry_id = ? AND voter_token = ?")
    .bind(entryId, voterToken)
    .first();

  if (existing) {
    const entry = await db.prepare("SELECT vote_count as voteCount FROM entries WHERE id = ?").bind(entryId).first<{
      voteCount: number;
    }>();
    return { voteCount: entry?.voteCount ?? 0, alreadyVoted: true };
  }

  await db
    .prepare("INSERT INTO votes (entry_id, voter_token, created_at) VALUES (?, ?, ?)")
    .bind(entryId, voterToken, Date.now())
    .run();
  await db.prepare("UPDATE entries SET vote_count = vote_count + 1 WHERE id = ?").bind(entryId).run();

  const entry = await db.prepare("SELECT vote_count as voteCount FROM entries WHERE id = ?").bind(entryId).first<{
    voteCount: number;
  }>();
  return { voteCount: entry?.voteCount ?? 0, alreadyVoted: false };
}
