/** Shown when the caller omits the trigger label. */
const DEFAULT_LOG_WATCH_TRIGGER_LABEL = 'Log Watch'

/**
 * Accessible name for the log-watch trigger.
 *
 * A custom visible label is announced with the title. When the caller omitted the label
 * or passed `null`, the name names the title so icon and default buttons stay distinct.
 *
 * @param title - Media title shown in the popover
 * @param triggerLabel - Visible override; `null` or omitted keeps a title-specific name
 * @returns The trigger `aria-label`
 */
export function logWatchTriggerAccessibleName(title: string, triggerLabel?: null | string): string {
  if (!triggerLabel) {
    return `Log a watch of ${title}`
  }

  return `${triggerLabel}, ${title}`
}

/**
 * Visible text for the log-watch trigger.
 *
 * An omitted label uses "Log Watch". `null` hides the text so an icon-only trigger
 * can keep the check mark without a caption.
 *
 * @param triggerLabel - Caller override, `null` to hide the text, or omit for the default
 * @returns The visible label, or `null` when the trigger should not show text
 */
export function logWatchTriggerLabel(triggerLabel?: null | string): null | string {
  if (triggerLabel === undefined) {
    return DEFAULT_LOG_WATCH_TRIGGER_LABEL
  }

  return triggerLabel
}
