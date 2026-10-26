import { describe, expect, it } from 'vitest'

import { reopenChallengeDescription } from '../reopen-challenge-description'

const kept = 'If you keep this challenge completed, its completion status will stay on record.'

describe('reopenChallengeDescription', () => {
  it('uses one count when every title added since the finish is still unwatched', () => {
    expect(reopenChallengeDescription(1, 1)).toBe(
      `1 title has been added since you finished. Reopening the challenge counts this title toward the goal, so the challenge will become active again until the title is marked watched. ${kept}`,
    )
    expect(reopenChallengeDescription(2, 2)).toBe(
      `2 titles have been added since you finished. Reopening the challenge counts these titles toward the goal, so the challenge will become active again until they are all marked watched. ${kept}`,
    )
  })

  it('counts titles added separately from the ones still unwatched', () => {
    expect(reopenChallengeDescription(3, 1)).toBe(
      `3 titles have been added since you finished. 1 of them is still unwatched. Reopening the challenge counts these titles toward the goal, so the challenge will become active again until that title is marked watched. ${kept}`,
    )
    expect(reopenChallengeDescription(3, 2)).toBe(
      `3 titles have been added since you finished. 2 of them are still unwatched. Reopening the challenge counts these titles toward the goal, so the challenge will become active again until those titles are marked watched. ${kept}`,
    )
  })
})
