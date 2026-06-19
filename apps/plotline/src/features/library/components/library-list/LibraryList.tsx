"use client";

import type { LibraryItem } from "@plotline/payload-types";

import { Fragment } from "react/jsx-runtime";

import type { LibraryFilters } from "@/lib/query/services/keys";

import { Card, CardContent } from "@/components/ui/card";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import { ErrorEmpty } from "@/components/utils/ErrorEmpty";
import { ShowIf } from "@/components/utils/ShowIf";
import { useLibraryItems } from "@/lib/query/hooks/use-library-items";
import { getErrorMessage } from "@/utils/get-error-message";

import { LibraryEmpty } from "./LibraryEmpty";
import { LibraryListItem } from "./LibraryListItem";

const ERROR_EMPTY_PROPS = {
  description:
    "Ensure the payload app is running and service credentials are configured.",
  title: "Could not load library",
};

type LibraryListProps = {
  filters?: LibraryFilters;
  initialData: LibraryItem[];
  initialError?: null | string;
};

export function LibraryList({
  filters,
  initialData,
  initialError = null,
}: LibraryListProps) {
  const { data: items = initialData, error } = useLibraryItems(filters, {
    initialData,
  });

  const errorMessage = getErrorMessage(error) ?? initialError;

  if (errorMessage) {
    return <ErrorEmpty {...ERROR_EMPTY_PROPS} errorMessage={errorMessage} />;
  }

  if (items.length === 0) {
    return <LibraryEmpty filters={filters} />;
  }

  return (
    <Card>
      <CardContent>
        <ItemGroup className="-m-(--card-spacing)">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <Fragment key={item.id}>
                <LibraryListItem item={item} />
                <ShowIf condition={!isLast}>
                  <ItemSeparator />
                </ShowIf>
              </Fragment>
            );
          })}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
