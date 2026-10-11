import { RememberTitleBreadcrumbParent } from '@/features/navigation/breadcrumbs/components/RememberTitleBreadcrumbParent'

import { LibraryTitleSearchProvider } from '../../providers/LibraryTitleSearchProvider'
import { LibraryFilterBar } from '../filters/LibraryFilterBar'
import { LibraryGrid } from '../grid/LibraryGrid'
import { LibraryPagination } from '../pagination/LibraryPagination'
import { LibraryPageHeading } from './LibraryPageHeading'

export function LibraryPage() {
  return (
    <LibraryTitleSearchProvider>
      <RememberTitleBreadcrumbParent href="/dashboard/library" label="Library" />
      <div className="flex flex-col gap-5">
        <LibraryPageHeading />

        <LibraryFilterBar />

        <section className="flex flex-col gap-5 scroll-mt-6" id="library-results">
          <LibraryGrid />
          <LibraryPagination />
        </section>
      </div>
    </LibraryTitleSearchProvider>
  )
}
