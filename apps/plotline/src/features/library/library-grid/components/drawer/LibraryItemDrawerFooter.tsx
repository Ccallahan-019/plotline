import { Button } from '@/components/ui/button'
import { DrawerFooter } from '@/components/ui/drawer'

export function LibraryItemDrawerFooter() {
  return (
    <DrawerFooter className="flex-row justify-end gap-2 border-t">
      <Button disabled type="button" variant="destructive">
        Remove from Library
      </Button>
    </DrawerFooter>
  )
}
