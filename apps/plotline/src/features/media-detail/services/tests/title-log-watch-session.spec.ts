import { describe, expect, it } from 'vitest'

import {
  type TitleLogWatchSession,
  titleLogWatchSessionAfter,
} from '../title-log-watch-session'

function session(overrides: Partial<TitleLogWatchSession> = {}): TitleLogWatchSession {
  return {
    episode: undefined,
    open: false,
    sessionKey: 0,
    ...overrides,
  }
}

describe('titleLogWatchSessionAfter', () => {
  it('prefills the requested episode and remounts the form', () => {
    const current = session()
    const next = titleLogWatchSessionAfter(
      current,
      { episodeNumber: 4, seasonNumber: 2, type: 'episode' },
      false,
    )

    expect(next).toEqual({
      episode: { episode: 4, season: 2 },
      open: true,
      sessionKey: 1,
    })
  })

  it('leaves the session in place while a submit or library write is in flight', () => {
    const current = session({
      episode: { episode: 1, season: 1 },
      open: true,
      sessionKey: 3,
    })

    expect(
      titleLogWatchSessionAfter(
        current,
        { episodeNumber: 2, seasonNumber: 1, type: 'episode' },
        true,
      ),
    ).toBe(current)
    expect(titleLogWatchSessionAfter(current, { type: 'mark-watched' }, true)).toBe(current)
  })

  it('keeps a Mark Watched edit mounted when the session has no episode prefill', () => {
    const current = session({ open: false, sessionKey: 2 })
    const next = titleLogWatchSessionAfter(current, { type: 'mark-watched' }, false)

    expect(next).toEqual({
      episode: undefined,
      open: true,
      sessionKey: 2,
    })
  })

  it('drops an episode prefill when Mark Watched opens the suggested next episode', () => {
    const next = titleLogWatchSessionAfter(
      session({
        episode: { episode: 4, season: 3 },
        open: false,
        sessionKey: 5,
      }),
      { type: 'mark-watched' },
      false,
    )

    expect(next).toEqual({
      episode: undefined,
      open: true,
      sessionKey: 6,
    })
  })
})
