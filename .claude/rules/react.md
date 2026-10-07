# React rules

## Don't set state directly inside a `useEffect` that depends on the state it sets

**Anti-pattern:**

```tsx
const [text, setText] = useState(() => formatValue(value))

useEffect(() => {
  if (handleRangeInput(text) !== value) {
    setText(formatValue(value))
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [value])
```

This reads `text` inside an effect that only lists `value` in its dependency array. Honestly listing `text` as a dependency would make the effect re-run every time `setText` fires — including from its own `setText` call — which is exactly the infinite-rerender loop the missing dependency is hiding. Suppressing `react-hooks/exhaustive-deps` to "fix" the lint error doesn't fix the underlying problem — it just hides a real staleness bug: the effect can now silently close over an outdated `text` on renders it doesn't re-run for.

**Fix: use an Effect Event.** `useEffectEvent` (React's Effect Event API) lets the effect read the latest value of `text` without treating it as reactive, so the effect's dependency array only needs to list what should actually trigger a re-sync (`value`):

```tsx
const [text, setText] = useState(() => formatValue(value))

const syncTextFromValue = useEffectEvent((nextValue: number | undefined) => {
  if (handleRangeInput(text) !== nextValue) {
    setText(formatValue(nextValue))
  }
})

useEffect(() => {
  syncTextFromValue(value)
}, [value])
```

`syncTextFromValue` always sees the latest `text` (Effect Events are non-reactive — they don't trigger the effect and don't need to be listed as a dependency), while the effect itself only re-runs when `value` changes for a reason other than the component's own edits. No `eslint-disable` needed, and `exhaustive-deps` stays enabled and meaningful.

**Rule of thumb:** if `react-hooks/exhaustive-deps` is telling you to add a dependency that would cause an infinite loop, that's a signal the effect needs an Effect Event, not a suppression comment. Never disable `exhaustive-deps` to work around this — reach for `useEffectEvent` instead.

See `apps/client-portal/src/features/shared/tables/components/filters/number-range/NumberRangeInput.tsx` for a real example, and `apps/client-portal/src/features/shared/tables/hooks/filters/useSingleSelectFilter.ts` for the same pattern already in use elsewhere in this codebase.

## Follow SOLID principles when authoring code

All agents authoring code in this repo — components, hooks, server actions, resolvers, utilities — must follow SOLID. These are design heuristics, not syntax rules: they apply as much to a hook or a server action as to a class.

### Single Responsibility Principle (SRP)

A module should have one reason to change. If a component or hook mixes data fetching, business rules, and presentation, a change to any one of those forces you to touch — and re-test — all of them.

**Acceptable pattern:**

```tsx
// useProductUnitStock.ts — owns data fetching only
export const useProductUnitStock = (productUnitId: string) => {
  return useQuery({
    queryKey: ['product-unit-stock', productUnitId],
    queryFn: () => fetchProductUnitStock(productUnitId),
  })
}

// StockBadge.tsx — owns presentation only
export const StockBadge = ({ productUnitId }: StockBadgeProps) => {
  const { data, isLoading } = useProductUnitStock(productUnitId)
  if (isLoading) return <Skeleton />
  return <Badge tone={data.quantity > 0 ? 'success' : 'warning'}>{data.quantity}</Badge>
}
```

**Anti-pattern:**

```tsx
// StockBadge.tsx — fetches, transforms business data, AND renders
export const StockBadge = ({ productUnitId }: StockBadgeProps) => {
  const [quantity, setQuantity] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/product-unit-stock/${productUnitId}`)
      .then((res) => res.json())
      .then((data) => {
        // reorder-point business logic buried in a UI component
        const adjusted = data.quantity - data.reservedForTransfers
        setQuantity(adjusted < data.reorderPoint ? 0 : adjusted)
      })
  }, [productUnitId])

  if (quantity === null) return <Skeleton />
  return <Badge tone={quantity > 0 ? 'success' : 'warning'}>{quantity}</Badge>
}
```

Now a change to the reorder-point rule requires editing a presentation component, and the component can't be reused without dragging the fetch/transform logic along with it.

### Open/Closed Principle (OCP)

Code should be open to extension but closed to modification — adding a new case shouldn't require editing a function's existing branches, only adding to them (or better, adding a new entry in a lookup/registry).

**Acceptable pattern:**

```tsx
const DOCUMENT_STATUS_RENDERERS: Record<DocumentStatus, (doc: Document) => ReactNode> = {
  draft: (doc) => <DraftBadge doc={doc} />,
  submitted: (doc) => <SubmittedBadge doc={doc} />,
  approved: (doc) => <ApprovedBadge doc={doc} />,
}

export const DocumentStatusCell = ({ doc }: { doc: Document }) => DOCUMENT_STATUS_RENDERERS[doc.status](doc)
```

Adding a new status means adding one entry to the map — no existing branch is touched, so there's nothing to regression-test in the existing cases.

**Anti-pattern:**

```tsx
export const DocumentStatusCell = ({ doc }: { doc: Document }) => {
  if (doc.status === 'draft') return <DraftBadge doc={doc} />
  if (doc.status === 'submitted') return <SubmittedBadge doc={doc} />
  if (doc.status === 'approved') return <ApprovedBadge doc={doc} />
  // every new status means editing this function and re-verifying every prior branch still works
  return null
}
```

### Liskov Substitution Principle (LSP)

A more specific implementation must be usable anywhere the general contract is expected, without the caller needing to know which implementation it got. Violations usually show up as a component/hook that narrows or breaks its own declared props/interface for certain inputs.

**Acceptable pattern:**

```tsx
type CountSheetLine = { productUnitId: string; quantity: number }

// every implementation returns the same shape and never throws for valid input —
// callers can swap strategies without changing how they consume the result
const roundToPackSize = (line: CountSheetLine, packSize: number): CountSheetLine => ({
  ...line,
  quantity: Math.round(line.quantity / packSize) * packSize,
})

const roundToWholeUnits = (line: CountSheetLine): CountSheetLine => ({
  ...line,
  quantity: Math.round(line.quantity),
})
```

**Anti-pattern:**

```tsx
// declares the same "rounding strategy" contract but silently changes behavior:
// throws instead of returning, and mutates the input instead of returning a new object
const roundToPackSize = (line: CountSheetLine, packSize: number): CountSheetLine => {
  if (packSize <= 0) throw new Error('invalid pack size') // other strategies never throw
  line.quantity = Math.round(line.quantity / packSize) * packSize // mutates caller's object
  return line
}
```

A caller that iterates over rounding strategies generically will crash or get unexpected mutation on this one, even though its type signature matches the others.

### Interface Segregation Principle (ISP)

Don't force a component/hook to depend on props or an interface wider than what it actually uses. Wide, do-everything prop types couple unrelated call sites together and make it unclear what a component actually needs to render.

**Acceptable pattern:**

```tsx
type QuantityCellProps = { quantity: number; uom: string }

export const QuantityCell = ({ quantity, uom }: QuantityCellProps) => (
  <span>
    {quantity} {uom}
  </span>
)

// caller narrows the full row down to only what QuantityCell needs
<QuantityCell quantity={row.quantity} uom={row.productUnit.uom} />
```

**Anti-pattern:**

```tsx
// takes the entire count-sheet-line row even though it only ever reads two fields
type QuantityCellProps = { line: CountSheetLine }

export const QuantityCell = ({ line }: QuantityCellProps) => (
  <span>
    {line.quantity} {line.productUnit.uom}
  </span>
)
```

Every caller now has to assemble a full `CountSheetLine` just to render a quantity, and `QuantityCell` breaks any time an unrelated field on `CountSheetLine` changes shape.

### Dependency Inversion Principle (DIP)

Depend on an abstraction (a passed-in function, a hook interface, a service type), not directly on a concrete low-level implementation. This is what makes code testable and swappable — e.g. a server action calling a data-access function it receives rather than importing a specific ORM call inline everywhere it's used.

**Acceptable pattern:**

```tsx
type StockRepository = {
  getQuantity: (productUnitId: string) => Promise<number>
}

// depends on the StockRepository abstraction, not on Payload directly
export const buildStockSummary = async (productUnitId: string, repo: StockRepository) => {
  const quantity = await repo.getQuantity(productUnitId)
  return { productUnitId, quantity }
}

// production wiring provides the concrete implementation
const payloadStockRepository: StockRepository = {
  getQuantity: (id) => payload.findByID({ collection: 'product-unit-stock', id }).then((doc) => doc.quantity),
}
```

`buildStockSummary` can be unit-tested with a fake `StockRepository` and has no idea Payload exists.

**Anti-pattern:**

```tsx
// directly depends on the concrete Payload Local API call
export const buildStockSummary = async (productUnitId: string) => {
  const doc = await payload.findByID({ collection: 'product-unit-stock', id: productUnitId })
  return { productUnitId, quantity: doc.quantity }
}
```

This can't be unit-tested without a real (or heavily mocked) Payload instance, and swapping the data source means editing every call site instead of swapping one wiring point.
