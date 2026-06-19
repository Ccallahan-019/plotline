import { useTmdbBrowse } from "../../providers/TmdbBrowseProvider";

export function PaginationResults() {
  const { page, searchResults, totalPages } = useTmdbBrowse();

  const totalResults = searchResults?.total_results ?? 0;

  return (
    <p className="text-sm text-muted-foreground">
      Page {page} of {totalPages.toLocaleString()} (
      {totalResults.toLocaleString()} results)
    </p>
  );
}
