'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import { useReopenChallenge } from '../hooks/use-reopen-challenge'
import { reopenChallengeDescription } from '../services/reopen-challenge-description'

type ReopenChallengeAlertProps = {
  newTitlesSinceCompletion: number
  slug: string
  unfinishedTitlesSinceCompletion: number
}

/**
 * Offers to reopen a completed list-size challenge that has unfinished titles added since it finished.
 *
 * The challenge stays completed until the user confirms. Titles that are already watched do not open this dialog.
 */
export function ReopenChallengeAlert({
  newTitlesSinceCompletion,
  slug,
  unfinishedTitlesSinceCompletion,
}: ReopenChallengeAlertProps) {
  const reopenChallenge = useReopenChallenge()
  const description = reopenChallengeDescription(
    newTitlesSinceCompletion,
    unfinishedTitlesSinceCompletion,
  )

  function handleReopenChallenge() {
    reopenChallenge.mutate(slug)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={reopenChallenge.isPending}
        render={<Button size="sm" type="button" variant="outline" />}
      >
        Reopen Challenge
      </AlertDialogTrigger>

      <AlertDialogContent className="data-[size=default]:sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Reopen this challenge?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={reopenChallenge.isPending}>
            Keep Challenge Completed
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={reopenChallenge.isPending}
            onClick={handleReopenChallenge}
            type="button"
          >
            Reopen Challenge
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
