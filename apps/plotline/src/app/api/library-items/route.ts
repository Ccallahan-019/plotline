import type { MediaStatus, MediaType } from "@plotline/shared/constants/media";

import { NextResponse } from "next/server";

import { handlePayloadError } from "@/lib/api/handle-payload-error";
import { requireClerkUserId } from "@/lib/api/require-clerk-user-id";
import { getLibraryItems } from "@/lib/payload/queries/get-library-items";

const VALID_STATUSES = new Set<MediaStatus>([
  "completed",
  "dropped",
  "on_hold",
  "planned",
  "watching",
]);
const VALID_MEDIA_TYPES = new Set<MediaType>(["movie", "tv"]);

export async function GET(request: Request) {
  const authResult = await requireClerkUserId();

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const mediaType = searchParams.get("mediaType");

  if (status && !VALID_STATUSES.has(status as MediaStatus)) {
    return NextResponse.json(
      { error: "Invalid status filter" },
      { status: 400 },
    );
  }

  if (mediaType && !VALID_MEDIA_TYPES.has(mediaType as MediaType)) {
    return NextResponse.json(
      { error: "Invalid mediaType filter" },
      { status: 400 },
    );
  }

  try {
    const items = await getLibraryItems(authResult.clerkUserId, {
      mediaType: mediaType as MediaType | undefined,
      status: status as MediaStatus | undefined,
    });

    return NextResponse.json(items);
  } catch (error) {
    return handlePayloadError(error);
  }
}
