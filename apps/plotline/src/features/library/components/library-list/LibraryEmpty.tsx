import { Library } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { LibraryFilters } from "@/lib/query/services/keys";

import { getLibraryEmptyCopy } from "../../constants/library-filters";

type LibraryEmptyProps = {
  filters?: LibraryFilters;
};

export function LibraryEmpty({ filters }: LibraryEmptyProps) {
  const emptyCopy = getLibraryEmptyCopy(filters ?? {});

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Library />
        </EmptyMedia>

        <EmptyTitle>{emptyCopy.title}</EmptyTitle>
        <EmptyDescription>{emptyCopy.description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
