import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'nextjs-toploader/app'

import { Button } from '@/components/ui/button'

export function MediaTitleBackButton() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/dashboard/library')
  }

  return (
    <Button
      aria-label="Go back"
      className="rounded-full md:hidden"
      onClick={handleBack}
      size="icon"
      type="button"
      variant="secondary"
    >
      <ArrowLeft />
    </Button>
  )
}
