import { LibraryItemDrawerPlaceholder } from './LibraryItemDrawerPlaceholder'

type LibraryItemDrawerFieldProps = {
  label: string
  value: null | string
}

export function LibraryItemDrawerField({ label, value }: LibraryItemDrawerFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex-1 text-sm text-muted-foreground">{label}</span>
      <LibraryItemDrawerPlaceholder value={value} />
    </div>
  )
}
