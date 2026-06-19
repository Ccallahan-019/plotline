"use client";

import { Button } from "@/components/ui/button";
import { PaginationEllipsis } from "@/components/ui/pagination";

import { useTmdbBrowse } from "../../providers/TmdbBrowseProvider";
import { PaginationRangeItem } from "../../services/get-pagination-range";

type PaginationPageButtonProps = {
  item: PaginationRangeItem;
};

export function PaginationPageButton({ item }: PaginationPageButtonProps) {
  const { page, setPage } = useTmdbBrowse();

  if (item === "ellipsis") {
    return <PaginationEllipsis />;
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setPage(item);
  };

  return (
    <Button onClick={handleClick} variant={page !== item ? "ghost" : "outline"}>
      {item}
    </Button>
  );
}
