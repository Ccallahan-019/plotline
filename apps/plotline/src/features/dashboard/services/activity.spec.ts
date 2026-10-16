import { describe, expect, it } from 'vitest'

import type { ActivityChallengeInput, ActivityEventInput, ActivityReviewInput } from './activity'

import { buildActivityRows, groupActivityRows, selectActivityPage } from './activity'

const TIME_ZONE = 'UTC'

describe('buildActivityRows', () => {
  it('labels watch events and keeps dropped and on hold under the watched filter', () => {
    const rows = build({
      events: [
        watch({
          eventType: 'completed',
          id: 1,
          media: movie(1, 'Heat'),
          watchedAt: '2026-04-01T00:00:00.000Z',
        }),
        watch({
          eventType: 'progress',
          id: 2,
          media: series(2, 'The Show'),
          tvContext: { episode: 4, season: 2 },
          watchedAt: '2026-03-01T00:00:00.000Z',
        }),
        watch({
          eventType: 'dropped',
          id: 3,
          media: movie(3, 'Dropped'),
          watchedAt: '2026-02-01T00:00:00.000Z',
        }),
        watch({
          eventType: 'on_hold',
          id: 4,
          media: movie(4, 'Paused'),
          watchedAt: '2026-01-01T00:00:00.000Z',
        }),
      ],
    })

    expect(rows.map((row) => [row.label, row.detail, row.filterKind])).toEqual([
      ['Watched', null, 'watched'],
      ['Watched', 'S2 · E4', 'watched'],
      ['Dropped', null, 'watched'],
      ['On hold', null, 'watched'],
    ])
    expect(rows[0]?.href).toBe('/dashboard/title/movie/1')
  })

  it('splits rated and reviewed rows and copies the rating onto a watch', () => {
    const rows = build({
      events: [watch({ id: 1, media: movie(5, 'Alien'), watchedAt: '2026-02-01T00:00:00.000Z' })],
      reviews: [
        review({ body: '  ', id: 2, media: movie(5, 'Alien'), rating: 8 }),
        review({
          body: 'A real review',
          id: 3,
          media: series(6, 'Show'),
          rating: 9,
          updatedAt: '2026-03-01T00:00:00.000Z',
        }),
      ],
    })
    const watched = rows.find((row) => row.filterKind === 'watched')
    const rated = rows.find((row) => row.filterKind === 'rated')
    const reviewed = rows.find((row) => row.filterKind === 'reviewed')

    expect(watched?.rating).toBe(8)
    expect(rated).toMatchObject({ label: 'Rated', occurredAt: '2026-01-01T00:00:00.000Z' })
    expect(reviewed).toMatchObject({ label: 'Reviewed', occurredAt: '2026-03-01T00:00:00.000Z' })
  })

  it('emits one challenge snapshot for an enabled challenge', () => {
    const rows = build({
      challenges: [
        challenge(),
        challenge({
          challenge: { ...challenge().challenge, enabled: false },
          id: 2,
          slug: 'off',
        }),
        challenge({ id: 3, slug: 'uncalculated', statsCache: null }),
      ],
    })

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      detail: '52 films in 2026 · 31 / 52',
      filterKind: 'challenge',
      href: '/dashboard/challenges/2026-films',
      label: 'Challenge',
      occurredAt: '2026-10-01T12:00:00.000Z',
      title: '2026 films',
    })
  })

  it('uses titles or hours in the challenge snapshot', () => {
    const titles = build({
      challenges: [
        challenge({
          challenge: { ...challenge().challenge, tvCountRule: 'tv_as_series' },
        }),
      ],
    })
    const hours = build({
      challenges: [
        challenge({
          challenge: {
            dueDate: '2026-12-31',
            enabled: true,
            goalRuntimeMinutes: 6000,
            goalType: 'runtime_minutes',
          },
          statsCache: {
            completed: 2280,
            goalRuntimeMinutes: 6000,
            lastCalculatedAt: '2026-10-01T12:00:00.000Z',
            totalEligible: 6000,
          },
        }),
      ],
    })

    expect(titles[0]?.detail).toBe('52 titles in 2026 · 31 / 52')
    expect(hours[0]?.detail).toBe('100 hours in 2026 · 38 / 100')
  })

  it('emits film milestones for completed movies and ignores series', () => {
    const movies = Array.from({ length: 10 }, (_, index) =>
      watch({
        id: index + 1,
        media: movie(index + 1),
        watchedAt: `2026-01-10T${String(index).padStart(2, '0')}:00:00.000Z`,
      }),
    )
    const rows = build({
      events: [
        ...movies,
        watch({
          eventType: 'rewatched',
          id: 11,
          media: movie(1),
          watchedAt: '2026-02-01T12:00:00.000Z',
        }),
        watch({
          id: 12,
          media: series(12, 'Not a film'),
          watchedAt: '2026-02-02T12:00:00.000Z',
        }),
      ],
    })
    const milestones = rows.filter((row) => row.filterKind === 'milestone')

    expect(milestones.map((row) => row.title)).toEqual(['10 films'])
    expect(milestones[0]?.occurredAt).toBe('2026-01-10T09:00:00.000Z')
    expect(milestones[0]?.mediaType).toBe('movie')
  })

  it('emits an hour milestone on the event that crosses the threshold', () => {
    const rows = build({
      events: [
        watch({ id: 1, runtimeMinutes: 540, watchedAt: '2026-01-01T00:00:00.000Z' }),
        watch({
          eventType: 'progress',
          id: 2,
          media: series(2, 'Show'),
          runtimeMinutes: 120,
          watchedAt: '2026-01-02T00:00:00.000Z',
        }),
        watch({
          eventType: 'dropped',
          id: 3,
          runtimeMinutes: 10_000,
          watchedAt: '2026-01-03T00:00:00.000Z',
        }),
      ],
    })
    const milestones = rows.filter((row) => row.filterKind === 'milestone')

    expect(milestones.map((row) => row.title)).toEqual(['10 hours'])
    expect(milestones[0]).toMatchObject({
      mediaType: null,
      occurredAt: '2026-01-02T00:00:00.000Z',
    })
  })

  it('emits streak milestones when a run reaches 7 and 14, then again after a gap', () => {
    const firstRun = days('2026-01-01', 14)
    const secondRun = days('2026-01-20', 7)
    const rows = build({ events: [...firstRun, ...secondRun] })
    const streaks = rows
      .filter((row) => row.title.endsWith('streak'))
      .map((row) => [row.title, row.occurredAt])

    expect(streaks).toEqual([
      ['7-day streak', '2026-01-26T12:00:00.000Z'],
      ['14-day streak', '2026-01-14T12:00:00.000Z'],
      ['7-day streak', '2026-01-07T12:00:00.000Z'],
    ])
  })
})

describe('selectActivityPage', () => {
  const events = [
    watch({ id: 1, watchedAt: '2026-08-01T12:00:00.000Z' }),
    watch({ id: 2, watchedAt: '2026-10-01T12:00:00.000Z' }),
    watch({ eventType: 'dropped', id: 3, watchedAt: '2026-10-14T12:00:00.000Z' }),
    watch({ id: 5, watchedAt: '2026-10-08T12:00:00.000Z' }),
    watch({ id: 4, media: series(4, 'Show'), watchedAt: '2026-10-10T12:00:00.000Z' }),
  ]

  it('filters by kind, media, and range, then pages with a cursor', () => {
    const rows = build({ events })
    const now = new Date('2026-10-14T18:00:00.000Z')
    const first = selectActivityPage(
      rows,
      {
        kind: 'watched',
        limit: 2,
        mediaType: 'movie',
        range: { days: 30, type: 'rolling' },
        timeZone: TIME_ZONE,
      },
      now,
    )

    expect(first.ok).toBe(true)
    if (!first.ok) {
      return
    }

    expect(first.page.rows.map((row) => row.title)).toEqual(['Film 3', 'Film 5'])
    expect(first.page.nextCursor).toEqual(expect.any(String))

    const second = selectActivityPage(
      rows,
      {
        cursor: first.page.nextCursor,
        kind: 'watched',
        limit: 2,
        mediaType: 'movie',
        range: { days: 30, type: 'rolling' },
        timeZone: TIME_ZONE,
      },
      now,
    )

    expect(second.ok && second.page.rows.map((row) => row.title)).toEqual(['Film 2'])
    expect(second.ok && second.page.nextCursor).toBeNull()
  })

  it('rejects a cursor that is not a page token', () => {
    const result = selectActivityPage(
      [],
      {
        cursor: 'not-a-cursor',
        kind: 'all',
        limit: 20,
        mediaType: 'all',
        range: { type: 'all' },
        timeZone: TIME_ZONE,
      },
      new Date('2026-10-14T00:00:00.000Z'),
    )

    expect(result).toEqual({ error: 'Invalid cursor', ok: false })
  })

  it('keeps film milestones on the movie filter and hour milestones on all', () => {
    const rows = build({
      events: [
        ...Array.from({ length: 10 }, (_, index) =>
          watch({
            id: index + 1,
            watchedAt: `2026-10-${String(index + 1).padStart(2, '0')}T12:00:00.000Z`,
          }),
        ),
        watch({ id: 20, runtimeMinutes: 600, watchedAt: '2026-10-11T12:00:00.000Z' }),
      ],
    })
    const moviePage = selectActivityPage(
      rows,
      {
        kind: 'milestone',
        limit: 20,
        mediaType: 'movie',
        range: { type: 'all' },
        timeZone: TIME_ZONE,
      },
      new Date('2026-10-14T00:00:00.000Z'),
    )

    expect(moviePage.ok && moviePage.page.rows.map((row) => row.title)).toEqual(['10 films'])
  })
})

describe('groupActivityRows', () => {
  it('labels today, yesterday, the weekday, last week, and older days', () => {
    const groups = groupActivityRows(
      [
        labeled('2026-10-14T12:00:00.000Z'),
        labeled('2026-10-13T12:00:00.000Z'),
        labeled('2026-10-12T12:00:00.000Z'),
        labeled('2026-10-11T12:00:00.000Z'),
        labeled('2026-10-06T12:00:00.000Z'),
        labeled('2026-10-04T12:00:00.000Z'),
      ],
      new Date('2026-10-14T18:00:00.000Z'),
      TIME_ZONE,
    )

    expect(groups.map((group) => [group.label, group.rows.length])).toEqual([
      ['Today', 1],
      ['Yesterday', 1],
      ['Monday', 1],
      ['Last week', 2],
      ['Oct 4', 1],
    ])
  })

  it('keeps Sunday as yesterday when today is Monday', () => {
    const groups = groupActivityRows(
      [
        labeled('2026-10-12T12:00:00.000Z'),
        labeled('2026-10-11T12:00:00.000Z'),
        labeled('2026-10-10T12:00:00.000Z'),
      ],
      new Date('2026-10-12T18:00:00.000Z'),
      TIME_ZONE,
    )

    expect(groups.map((group) => group.label)).toEqual(['Today', 'Yesterday', 'Last week'])
  })

  it('uses the request timezone when a UTC instant is still the previous evening', () => {
    const groups = groupActivityRows(
      [labeled('2026-10-14T02:00:00.000Z')],
      new Date('2026-10-14T15:00:00.000Z'),
      'America/New_York',
    )

    expect(groups[0]?.label).toBe('Yesterday')
  })
})

function build(input: {
  challenges?: ActivityChallengeInput[]
  events?: ActivityEventInput[]
  reviews?: ActivityReviewInput[]
  timeZone?: string
}) {
  return buildActivityRows({
    challenges: input.challenges ?? [],
    events: input.events ?? [],
    reviews: input.reviews ?? [],
    timeZone: input.timeZone ?? TIME_ZONE,
  })
}

function challenge(overrides: Partial<ActivityChallengeInput> = {}): ActivityChallengeInput {
  return {
    challenge: {
      dueDate: '2026-12-31',
      enabled: true,
      goalCount: 52,
      goalType: 'count',
      tvCountRule: 'movies_only',
    },
    id: 1,
    name: '2026 films',
    slug: '2026-films',
    statsCache: {
      completed: 31,
      goalCount: 52,
      lastCalculatedAt: '2026-10-01T12:00:00.000Z',
      totalEligible: 52,
    },
    ...overrides,
  }
}

function days(start: string, count: number): ActivityEventInput[] {
  const startDate = new Date(`${start}T12:00:00.000Z`)

  return Array.from({ length: count }, (_, index) => {
    const watchedAt = new Date(startDate.getTime() + index * 86_400_000).toISOString()

    return watch({ id: index + 1 + startDate.getUTCDate() * 100, watchedAt })
  })
}

function labeled(occurredAt: string) {
  return {
    detail: null,
    filterKind: 'watched' as const,
    href: null,
    id: occurredAt,
    label: 'Watched',
    mediaType: 'movie' as const,
    occurredAt,
    posterPath: null,
    rating: null,
    title: occurredAt,
    tmdbId: null,
  }
}

function movie(id: number, title = `Film ${id}`) {
  return { id, mediaType: 'movie' as const, title, tmdbId: id }
}

function review(
  overrides: Partial<ActivityReviewInput> & Pick<ActivityReviewInput, 'id' | 'media'>,
): ActivityReviewInput {
  return {
    body: null,
    rating: 8,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function series(id: number, title: string) {
  return { id, mediaType: 'tv' as const, title, tmdbId: id }
}

function watch(
  overrides: Partial<ActivityEventInput> & Pick<ActivityEventInput, 'id'>,
): ActivityEventInput {
  return {
    eventType: 'completed',
    media: movie(overrides.id, `Film ${overrides.id}`),
    watchedAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  }
}
