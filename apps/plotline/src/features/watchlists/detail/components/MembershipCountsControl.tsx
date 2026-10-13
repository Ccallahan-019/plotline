'use client'

import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { Info } from 'lucide-react'
import { useId } from 'react'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ShowIf } from '@/components/utils/ShowIf'
import { cn } from '@/lib/utils'

import { useExcludeMembershipFromGoal } from '../hooks/use-exclude-membership-from-goal'
import { getMembershipChallengeExclusion } from '../services/membership-goal-counts'

type MembershipCountsControlProps = {
  challenge: null | Watchlist['challenge']
  membership: WatchlistMembership
  slug: string
  title: string
}

export function MembershipCountsControl({
  challenge,
  membership,
  slug,
  title,
}: MembershipCountsControlProps) {
  const checkboxId = useId()
  const descriptionId = useId()
  const update = useExcludeMembershipFromGoal()
  const exclusion = getMembershipChallengeExclusion(membership, challenge)
  const note = exclusion?.note ?? null
  const checked = membership.countsTowardGoal === true

  const handleCheckedChange = (next: boolean) => {
    if (note || update.isPending || next === checked) {
      return
    }

    update.mutate({
      challenge,
      excludeFromGoal: !next,
      membershipId: membership.id,
      slug,
    })
  }

  return (
    <div className="flex items-center gap-2">
      <ShowIf condition={exclusion?.badge === 'rewatch'}>
        <Badge className="h-7" variant="secondary">
          Rewatch
        </Badge>
      </ShowIf>
      <Field orientation="horizontal">
        <Checkbox
          aria-describedby={note ? descriptionId : undefined}
          aria-label={`Counts toward the goal for ${title}`}
          checked={checked}
          className={cn(note != null && 'cursor-not-allowed')}
          disabled={note != null}
          id={checkboxId}
          onCheckedChange={handleCheckedChange}
        />
        {/* Stays mounted so the disabled checkbox can name the exclusion rule. */}
        <ShowIf condition={note != null}>
          <span className="sr-only" id={descriptionId}>
            {note}
          </span>
        </ShowIf>
        <FieldLabel className={cn(note && 'text-muted-foreground')} htmlFor={checkboxId}>
          Counts
        </FieldLabel>

        <ShowIf condition={note != null}>
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-4 text-destructive" />
            </TooltipTrigger>
            <TooltipContent>{note}</TooltipContent>
          </Tooltip>
        </ShowIf>
      </Field>
    </div>
  )
}
