import { createTmdbClient } from "@plotline/shared/tmdb";
import { NextResponse } from "next/server";

import { handlePayloadError } from "@/lib/api/handle-payload-error";
import { requireClerkUserId } from "@/lib/api/require-clerk-user-id";

export async function GET(request: Request) {
  const authResult = await requireClerkUserId();

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB is not configured" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const page = Number(searchParams.get("page") ?? "1");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter q is required" },
      { status: 400 },
    );
  }

  try {
    const client = createTmdbClient(apiKey);
    const results = await client.searchMulti(
      query,
      Number.isNaN(page) ? 1 : page,
    );

    return NextResponse.json(results);
  } catch (error) {
    return handlePayloadError(error);
  }
}
