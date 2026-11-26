import type { LogWatchEpisodeInput } from '@/features/library/log-watch/services/log-watch-form-schema'

export type TitleLogWatchSession = {
  episode: LogWatchEpisodeInput | undefined
  open: boolean
  sessionKey: number
}

export type TitleLogWatchSessionRequest =
  | {
      episodeNumber: number
      seasonNumber: number
      type: 'episode'
    }
  | {
      type: 'mark-watched'
    }

/**
 * Next log-watch dialog session after Mark Watched or an episode button.
 *
 * A blocked request leaves the session untouched, so an in-flight submit is not
 * remounted. Mark Watched keeps the mounted form when this session was not opened
 * from an episode, which preserves a cancelled edit. Leaving an episode prefill
 * clears it and bumps `sessionKey`, remounting onto the suggested next episode.
 * An episode button stores that episode and bumps `sessionKey`.
 *
 * @param session - Dialog episode, open flag, and remount key
 * @param request - Mark Watched, or the season and episode to prefill
 * @param blocked - When true, a library write or log-watch submit is in flight
 * @returns The next session, or `session` itself when `blocked` is true
 */
export function titleLogWatchSessionAfter(
  session: TitleLogWatchSession,
  request: TitleLogWatchSessionRequest,
  blocked: boolean,
): TitleLogWatchSession {
  if (blocked) {
    return session
  }

  switch (request.type) {
    case 'episode': {
      const { episodeNumber, seasonNumber } = request

      return {
        episode: {
          episode: episodeNumber,
          season: seasonNumber,
        },
        open: true,
        sessionKey: session.sessionKey + 1,
      }
    }
    case 'mark-watched': {
      const { episode, sessionKey } = session

      if (episode == null) {
        return {
          episode: undefined,
          open: true,
          sessionKey,
        }
      }

      return {
        episode: undefined,
        open: true,
        sessionKey: sessionKey + 1,
      }
    }
    default: {
      const unhandled: never = request

      return unhandled
    }
  }
}
