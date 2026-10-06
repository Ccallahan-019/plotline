import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getInitialLibraryItemsLookup } from '@/features/library/library-grid/services/get-initial-library-items'
import { SearchPage } from '@/features/search/components/page/SearchPage'
import { BrowseModeProvider } from '@/features/search/providers/BrowseModeProvider'
import { MediaTypeProvider } from '@/features/search/providers/MediaTypeProvider'
import { SearchFilterRegistryProvider } from '@/features/search/providers/SearchFilterRegistryProvider'
import { SearchFiltersRootProvider } from '@/features/search/providers/SearchFiltersRootProvider'
import { SearchLibraryItemsProvider } from '@/features/search/providers/SearchLibraryItemsProvider'
import { SearchSortProvider } from '@/features/search/providers/SearchSortProvider'
import { TmdbBrowseProvider } from '@/features/search/providers/TmdbBrowseProvider'
import { TmdbGenresProvider } from '@/features/search/providers/TmdbGenresProvider'
import { TmdbWatchProvidersProvider } from '@/features/search/providers/TmdbWatchProvidersProvider'

export const metadata = {
  title: 'Search TMDB',
}

export default async function DashboardSearchPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { initialLibraryItems } = await getInitialLibraryItemsLookup(userId)

  return (
    <SearchFiltersRootProvider>
      <BrowseModeProvider>
        <MediaTypeProvider>
          <SearchSortProvider>
            <TmdbBrowseProvider>
              <TmdbGenresProvider>
                <TmdbWatchProvidersProvider>
                  <SearchFilterRegistryProvider>
                    <SearchLibraryItemsProvider initialData={initialLibraryItems}>
                      <SearchPage />
                    </SearchLibraryItemsProvider>
                  </SearchFilterRegistryProvider>
                </TmdbWatchProvidersProvider>
              </TmdbGenresProvider>
            </TmdbBrowseProvider>
          </SearchSortProvider>
        </MediaTypeProvider>
      </BrowseModeProvider>
    </SearchFiltersRootProvider>
  )
}
