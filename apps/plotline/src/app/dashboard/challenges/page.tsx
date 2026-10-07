import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'My Challenges',
}

export default async function ChallengesPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">My Challenges</h1>
      <p className="text-muted-foreground">Challenge lists are coming soon.</p>
    </div>
  )
}
