import { LibraryFilterBar } from '../filters/LibraryFilterBar'
import { LibraryGrid } from '../grid/LibraryGrid'
import { LibraryPagination } from '../pagination/LibraryPagination'

export function LibraryPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Library</h1>
        <p className="text-muted-foreground">Browse and filter every title in your collection.</p>
      </div>

      <LibraryFilterBar />

      <section className="flex flex-col gap-5 scroll-mt-6" id="library-results">
        <LibraryGrid />
        <LibraryPagination />
      </section>
    </div>
  )
}
