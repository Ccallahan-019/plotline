"use client";

import { Search } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { useBrowseMode } from "../../providers/BrowseModeProvider";
import { useTmdbBrowse } from "../../providers/TmdbBrowseProvider";

export function SearchResultEmptyResults() {
  const { mode } = useBrowseMode();
  const { query } = useTmdbBrowse();

  const description =
    mode === "search" && query
      ? `No titles matched "${query}".`
      : "No titles matched the current filters.";

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyTitle>No Results Found</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
