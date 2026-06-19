"use client";

import { useEffect, useRef } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

import { useTmdbBrowse } from "../../providers/TmdbBrowseProvider";
import { getPaginationRange } from "../../services/get-pagination-range";
import { PaginationNextButton } from "../pagination/PaginationNextButton";
import { PaginationPageButton } from "../pagination/PaginationPageButton";
import { PaginationPreviousButton } from "../pagination/PaginationPreviousButton";
import { PaginationResults } from "../pagination/PaginationResults";

export function SearchResultPagination() {
  const { errorMessage, page, searchResults, showPrompt, totalPages } =
    useTmdbBrowse();

  const prevPageRef = useRef(page);

  useEffect(() => {
    if (prevPageRef.current === page) {
      return;
    }
    prevPageRef.current = page;
    document
      .getElementById("search-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  const showPagination =
    !showPrompt &&
    !errorMessage &&
    totalPages > 1 &&
    (searchResults?.results.length ?? 0) > 0;

  if (!showPagination) {
    return null;
  }

  const paginationRange = getPaginationRange(page, totalPages);

  return (
    <div className="flex flex-col items-center gap-3">
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPreviousButton />
          </PaginationItem>
          {paginationRange.map((item, index) => {
            return (
              <PaginationPageButton
                item={item}
                key={`pagination-${item}-${index}`}
              />
            );
          })}
          <PaginationItem>
            <PaginationNextButton />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <PaginationResults />
    </div>
  );
}
