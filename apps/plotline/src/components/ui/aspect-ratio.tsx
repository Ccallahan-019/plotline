import { cn } from '@/lib/utils'

function AspectRatio({
  className,
  ratio,
  ...props
}: { ratio: number } & React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('relative aspect-(--ratio)', className)}
      data-slot="aspect-ratio"
      style={
        {
          '--ratio': ratio,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { AspectRatio }
