import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getInitialLibraryItems } from "@/features/library/services/get-initial-library-items";
import { SearchPage } from "@/features/search/components/page/SearchPage";
import { BrowseModeProvider } from "@/features/search/providers/BrowseModeProvider";
import { FilterErrorsProvider } from "@/features/search/providers/FilterErrorsProvider";
import { MediaTypeProvider } from "@/features/search/providers/MediaTypeProvider";
import { SearchFiltersProvider } from "@/features/search/providers/SearchFiltersProvider";
import { SearchLibraryItemsProvider } from "@/features/search/providers/SearchLibraryItemsProvider";
import { SearchSortProvider } from "@/features/search/providers/SearchSortProvider";
import { TmdbBrowseProvider } from "@/features/search/providers/TmdbBrowseProvider";
import { TmdbGenresProvider } from "@/features/search/providers/TmdbGenresProvider";
import { TmdbWatchProvidersProvider } from "@/features/search/providers/TmdbWatchProvidersProvider";
import { OpenStateProvider } from "@/providers/OpenStateProvider";

export const metadata = {
  title: "Search TMDB",
};

export default async function DashboardSearchPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { initialLibraryItems } = await getInitialLibraryItems(userId);

  return (
    <OpenStateProvider>
      <BrowseModeProvider>
        <FilterErrorsProvider>
          <MediaTypeProvider>
            <SearchFiltersProvider>
              <SearchSortProvider>
                <TmdbBrowseProvider>
                  <TmdbGenresProvider>
                    <TmdbWatchProvidersProvider>
                      <SearchLibraryItemsProvider
                        initialData={initialLibraryItems}
                      >
                        <SearchPage />
                      </SearchLibraryItemsProvider>
                    </TmdbWatchProvidersProvider>
                  </TmdbGenresProvider>
                </TmdbBrowseProvider>
              </SearchSortProvider>
            </SearchFiltersProvider>
          </MediaTypeProvider>
        </FilterErrorsProvider>
      </BrowseModeProvider>
    </OpenStateProvider>
  );
}
