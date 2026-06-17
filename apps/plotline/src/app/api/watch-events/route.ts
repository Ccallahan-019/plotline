import { NextResponse } from "next/server";

import { handlePayloadError } from "@/lib/api/handle-payload-error";
import { requireClerkUserId } from "@/lib/api/require-clerk-user-id";
import { getWatchEvents } from "@/lib/payload/queries/get-watch-events";

export async function GET(request: Request) {
  const authResult = await requireClerkUserId();

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const sort = searchParams.get("sort") ?? undefined;
  const limit = limitParam ? Number(limitParam) : undefined;

  if (
    limit !== undefined &&
    (Number.isNaN(limit) || limit < 1 || limit > 100)
  ) {
    return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
  }

  try {
    const events = await getWatchEvents(authResult.clerkUserId, {
      limit,
      sort,
    });

    return NextResponse.json(events);
  } catch (error) {
    return handlePayloadError(error);
  }
}
