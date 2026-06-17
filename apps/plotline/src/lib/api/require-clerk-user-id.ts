import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function requireClerkUserId(): Promise<
  { clerkUserId: string } | NextResponse
> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return { clerkUserId: userId };
}
