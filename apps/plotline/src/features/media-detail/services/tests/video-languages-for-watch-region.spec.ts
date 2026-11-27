import { describe, expect, it } from 'vitest'

import { videoLanguagesForWatchRegion } from '../video-languages-for-watch-region'

describe('videoLanguagesForWatchRegion', () => {
  it('requests the primary language for a non-English watch region', () => {
    expect(videoLanguagesForWatchRegion('FR')).toEqual(['fr'])
    expect(videoLanguagesForWatchRegion('jp')).toEqual(['ja'])
    expect(videoLanguagesForWatchRegion('DE')).toEqual(['de'])
    expect(videoLanguagesForWatchRegion('BR')).toEqual(['pt'])
    expect(videoLanguagesForWatchRegion('MX')).toEqual(['es'])
    expect(videoLanguagesForWatchRegion('IN')).toEqual(['hi'])
  })

  it('adds nothing when the region already speaks English', () => {
    expect(videoLanguagesForWatchRegion('US')).toEqual([])
    expect(videoLanguagesForWatchRegion('GB')).toEqual([])
    expect(videoLanguagesForWatchRegion('CA')).toEqual([])
    expect(videoLanguagesForWatchRegion('AU')).toEqual([])
  })

  it('adds nothing for a blank or invalid region', () => {
    expect(videoLanguagesForWatchRegion('')).toEqual([])
    expect(videoLanguagesForWatchRegion('U')).toEqual([])
    expect(videoLanguagesForWatchRegion('USA')).toEqual([])
  })
})
