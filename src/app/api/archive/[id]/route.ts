import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";
import { getPromptById, listEntries } from "@/lib/db";
import type { CloudflareEnv } from "@/types";

export const runtime = "edge";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { DB } = getRequestContext().env as CloudflareEnv;

  const prompt = await getPromptById(DB, params.id);
  if (!prompt) {
    return NextResponse.json({ error: "No archived day found for that date." }, { status: 404 });
  }

  const rows = await listEntries(DB, prompt.id, "top");
  const entries = rows.map((row) => ({
    id: row.id,
    body: row.body,
    voteCount: row.voteCount,
    createdAt: row.createdAt,
  }));

  return NextResponse.json({ prompt, entries });
}
