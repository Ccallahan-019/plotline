import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { LibraryPage } from '@/features/library/library-grid/components/page/LibraryPage'
import { LibraryBrowseProvider } from '@/features/library/library-grid/providers/LibraryBrowseProvider'
import { LibraryFilterRegistryProvider } from '@/features/library/library-grid/providers/LibraryFilterRegistryProvider'
import { LibraryFiltersRootProvider } from '@/features/library/library-grid/providers/LibraryFiltersRootProvider'
import { getInitialLibraryItems } from '@/features/library/library-grid/services/get-initial-library-items'

export const metadata = {
  title: 'Library',
}

export default async function DashboardLibraryPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { initialError, initialLibraryItems } = await getInitialLibraryItems(userId)

  return (
    <LibraryFiltersRootProvider>
      <LibraryFilterRegistryProvider>
        <LibraryBrowseProvider initialData={initialLibraryItems} initialError={initialError}>
          <LibraryPage />
        </LibraryBrowseProvider>
      </LibraryFilterRegistryProvider>
    </LibraryFiltersRootProvider>
  )
}
