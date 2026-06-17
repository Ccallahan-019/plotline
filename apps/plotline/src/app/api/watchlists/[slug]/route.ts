import { NextResponse } from "next/server";

import { handlePayloadError } from "@/lib/api/handle-payload-error";
import { requireClerkUserId } from "@/lib/api/require-clerk-user-id";
import { getWatchlistBySlug } from "@/lib/payload/queries/get-watchlists";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireClerkUserId();

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { slug } = await context.params;

  try {
    const watchlist = await getWatchlistBySlug(authResult.clerkUserId, slug);

    if (!watchlist) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(watchlist);
  } catch (error) {
    return handlePayloadError(error);
  }
}
