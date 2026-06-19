import { PaginationPrevious } from "@/components/ui/pagination";

import { useTmdbBrowse } from "../../providers/TmdbBrowseProvider";

export function PaginationPreviousButton() {
  const { page, setPage } = useTmdbBrowse();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <PaginationPrevious
      aria-disabled={page <= 1}
      className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
      href="#"
      onClick={handleClick}
    />
  );
}
