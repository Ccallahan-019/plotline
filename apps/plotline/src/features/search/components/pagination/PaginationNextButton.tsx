"use client";

import { PaginationNext } from "@/components/ui/pagination";

import { useTmdbBrowse } from "../../providers/TmdbBrowseProvider";

export function PaginationNextButton() {
  const { page, setPage, totalPages } = useTmdbBrowse();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <PaginationNext
      aria-disabled={page >= totalPages}
      className={
        page >= totalPages ? "pointer-events-none opacity-50" : undefined
      }
      href="#"
      onClick={handleClick}
    />
  );
}
