import { Compass, Search } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { useBrowseMode } from "../../providers/BrowseModeProvider";

export function SearchResultEmptySearch() {
  const { mode } = useBrowseMode();

  const isDiscoverMode = mode === "discover";

  const icon = isDiscoverMode ? <Compass /> : <Search />;
  const title = isDiscoverMode ? "Discover titles" : "Search by title";
  const description = isDiscoverMode
    ? "Browse popular titles by type, or switch to Search to find a specific title."
    : "Enter at least 2 characters to search TMDB.";

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
