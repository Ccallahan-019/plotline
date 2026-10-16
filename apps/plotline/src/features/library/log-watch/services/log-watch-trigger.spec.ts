import { describe, expect, it } from 'vitest'

import { logWatchTriggerAccessibleName, logWatchTriggerLabel } from './log-watch-trigger'

describe('logWatchTriggerLabel', () => {
  it('uses Log Watch when the caller omits the label', () => {
    expect(logWatchTriggerLabel(undefined)).toBe('Log Watch')
  })

  it('hides the text when the caller passes null', () => {
    expect(logWatchTriggerLabel(null)).toBeNull()
  })

  it('keeps a custom label', () => {
    expect(logWatchTriggerLabel('Log S3 E9')).toBe('Log S3 E9')
  })
})

describe('logWatchTriggerAccessibleName', () => {
  it('names the title when the caller did not set a label', () => {
    expect(logWatchTriggerAccessibleName('Dune')).toBe('Log a watch of Dune')
  })

  it('names the title when the caller hides the label', () => {
    expect(logWatchTriggerAccessibleName('Dune', null)).toBe('Log a watch of Dune')
  })

  it('announces a custom label with the title', () => {
    expect(logWatchTriggerAccessibleName('The Bear', 'Log S3 E9')).toBe('Log S3 E9, The Bear')
  })
})
