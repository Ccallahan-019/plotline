"use client";

import { Spinner } from "@/components/ui/spinner";

import { useTmdbBrowse } from "../../providers/TmdbBrowseProvider";

export function IsFetchingIndicator() {
  const { isFetching } = useTmdbBrowse();

  if (!isFetching) return null;

  return <Spinner className="size-4" />;
}
