import { MediaGridItemLoading } from "@/features/media/components/MediaGridItemLoading";

import { SearchResultGridContainer } from "./SearchResultGridContainer";

export function SearchResultGridLoading() {
  return (
    <SearchResultGridContainer>
      {Array.from({ length: 20 }).map((_, index) => (
        <MediaGridItemLoading key={index} ratio={2 / 3} />
      ))}
    </SearchResultGridContainer>
  );
}
