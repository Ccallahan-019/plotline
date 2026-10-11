import { TitleBreadcrumbParentProvider } from '@/features/navigation/breadcrumbs/components/TitleBreadcrumbParentProvider'

import { LibraryTitleSearchProvider } from '../../providers/LibraryTitleSearchProvider'
import { LibraryFilterBar } from '../filters/LibraryFilterBar'
import { LibraryGrid } from '../grid/LibraryGrid'
import { LibraryPagination } from '../pagination/LibraryPagination'
import { LibraryPageHeading } from './LibraryPageHeading'

export function LibraryPage() {
  return (
    <LibraryTitleSearchProvider>
      <TitleBreadcrumbParentProvider href="/dashboard/library" label="Library">
        <div className="flex flex-col gap-5">
          <LibraryPageHeading />

          <LibraryFilterBar />

          <section className="flex flex-col gap-5 scroll-mt-6" id="library-results">
            <LibraryGrid />
            <LibraryPagination />
          </section>
        </div>
      </TitleBreadcrumbParentProvider>
    </LibraryTitleSearchProvider>
  )
}
