import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePrompt, hasSubmittedToday, insertEntry, listEntries } from "@/lib/db";
import { getOrCreateVisitorToken, visitorCookieHeader } from "@/lib/identity";
import { checkRateLimit } from "@/lib/kv";
import { isValidSixWordEntry, promptTextForDate, utcDateKey } from "@/lib/prompts";
import type { CloudflareEnv } from "@/types";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { DB } = getRequestContext().env as CloudflareEnv;
  const sort = request.nextUrl.searchParams.get("sort") === "top" ? "top" : "new";
  const now = new Date();
  const dateKey = utcDateKey(now);
  const prompt = await getOrCreatePrompt(DB, dateKey, promptTextForDate(now));

  const { token } = getOrCreateVisitorToken(request.headers.get("cookie"));
  const rows = await listEntries(DB, prompt.id, sort);
  const entries = rows.map((row) => ({
    ...row,
    votedByMe: false, // resolved client-side per-entry via /api/vote responses; avoids an N-query join here
    isMine: false,
  }));

  return NextResponse.json({ entries, promptId: prompt.id, viewerToken: token });
}

export async function POST(request: NextRequest) {
  const { DB, VOTES_KV } = getRequestContext().env as CloudflareEnv;
  const { token, isNew } = getOrCreateVisitorToken(request.headers.get("cookie"));

  const body = (await request.json().catch(() => null)) as { body?: string } | null;
  if (!body || typeof body.body !== "string" || !isValidSixWordEntry(body.body)) {
    return NextResponse.json({ error: "Entry must be exactly six words." }, { status: 400 });
  }

  const allowed = await checkRateLimit(VOTES_KV, `submit:${token}`, 3, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many submissions. Try again in a minute." }, { status: 429 });
  }

  const now = new Date();
  const dateKey = utcDateKey(now);
  const prompt = await getOrCreatePrompt(DB, dateKey, promptTextForDate(now));

  if (await hasSubmittedToday(DB, prompt.id, token)) {
    return NextResponse.json({ error: "You already submitted today's story." }, { status: 409 });
  }

  const entry = {
    id: crypto.randomUUID(),
    promptId: prompt.id,
    body: body.body.trim(),
    authorToken: token,
    createdAt: Date.now(),
  };
  await insertEntry(DB, entry);

  const response = NextResponse.json({ entry: { ...entry, voteCount: 0, votedByMe: false, isMine: true } });
  if (isNew) response.headers.set("set-cookie", visitorCookieHeader(token));
  return response;
}
