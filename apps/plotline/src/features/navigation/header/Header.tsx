import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/features/navigation/breadcrumbs/components/Breadcrumbs'
import { SidebarTrigger } from '@/features/navigation/side-nav/components/SidebarTrigger'
import { ThemeToggle } from '@/features/theme/components/ThemeToggle'

import { HeaderContainer } from './HeaderContainer'
import { SignUpLink } from './SignUpLink'

export function Header() {
  return (
    <HeaderContainer>
      <SignedIn>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SidebarTrigger />
          <Breadcrumbs />
        </div>
      </SignedIn>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <SignedOut>
          <SignInButton mode="modal">
            <Button size="sm" variant="outline">
              Sign in
            </Button>
          </SignInButton>
          <SignUpLink />
        </SignedOut>
      </div>
    </HeaderContainer>
  )
}
