export const metadata = {
  title: 'My Challenges',
}

// Auth is enforced for `/dashboard/**` by `src/proxy.ts`.
export default function ChallengesPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">My Challenges</h1>
      <p className="text-muted-foreground">Challenge lists are coming soon.</p>
    </div>
  )
}
