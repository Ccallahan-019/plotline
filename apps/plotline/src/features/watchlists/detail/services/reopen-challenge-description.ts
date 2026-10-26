const KEEP_COMPLETED =
  'If you keep this challenge completed, its completion status will stay on record.'

/**
 * Confirmation copy before reopening a completed list-size challenge.
 *
 * `newTitlesSinceCompletion` is every qualifying title added after the finish.
 * `unfinishedTitlesSinceCompletion` is the subset still open. When some of those
 * titles are already watched, the added count and the still-open count are both stated.
 *
 * @param newTitlesSinceCompletion - Qualifying titles added since the challenge finished
 * @param unfinishedTitlesSinceCompletion - Those titles that are not watched yet
 * @returns Description for the reopen confirmation dialog
 */
export function reopenChallengeDescription(
  newTitlesSinceCompletion: number,
  unfinishedTitlesSinceCompletion: number,
): string {
  const added = wholeCount(newTitlesSinceCompletion)
  const unfinished = wholeCount(unfinishedTitlesSinceCompletion)

  if (added > unfinished && unfinished > 0) {
    return `${addedSinceFinished(added)} ${stillUnwatched(unfinished)} ${reopenUntilUnfinished(unfinished)} ${KEEP_COMPLETED}`
  }

  const titles = Math.max(added, unfinished)

  return `${addedSinceFinished(titles)} ${reopenUntilAll(titles)} ${KEEP_COMPLETED}`
}

// How many qualifying titles were added after the finish.
function addedSinceFinished(count: number): string {
  if (count === 1) {
    return '1 title has been added since you finished.'
  }

  return `${count} titles have been added since you finished.`
}

// What reopening does when every added title is still open.
function reopenUntilAll(count: number): string {
  if (count === 1) {
    return 'Reopening the challenge counts this title toward the goal, so the challenge will become active again until the title is marked watched.'
  }

  return 'Reopening the challenge counts these titles toward the goal, so the challenge will become active again until they are all marked watched.'
}

// What reopening does when some added titles are already watched.
function reopenUntilUnfinished(unfinished: number): string {
  if (unfinished === 1) {
    return 'Reopening the challenge counts these titles toward the goal, so the challenge will become active again until that title is marked watched.'
  }

  return 'Reopening the challenge counts these titles toward the goal, so the challenge will become active again until those titles are marked watched.'
}

// Added titles that are still open. The added count in the previous sentence is larger.
function stillUnwatched(count: number): string {
  if (count === 1) {
    return '1 of them is still unwatched.'
  }

  return `${count} of them are still unwatched.`
}

// A missing or fractional count is not shown as a partial title.
function wholeCount(count: number): number {
  if (!Number.isFinite(count) || count <= 0) {
    return 0
  }

  return Math.floor(count)
}
