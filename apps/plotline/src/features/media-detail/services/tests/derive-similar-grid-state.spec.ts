import { describe, expect, it } from 'vitest'

import { deriveSimilarGridState } from '../derive-similar-grid-state'

const IDLE = { isError: false, isLoading: false }

describe('deriveSimilarGridState', () => {
  it('is loading while either query loads its first data', () => {
    expect(deriveSimilarGridState({ ...IDLE, isLoading: true }, IDLE, 0)).toBe('loading')
    expect(deriveSimilarGridState(IDLE, { ...IDLE, isLoading: true }, 5)).toBe('loading')
  })

  it('is an error when either query failed', () => {
    expect(deriveSimilarGridState({ ...IDLE, isError: true }, IDLE, 0)).toBe('error')
    expect(deriveSimilarGridState(IDLE, { ...IDLE, isError: true }, 5)).toBe('error')
  })

  it('is empty when nothing is loading and there are no titles', () => {
    expect(deriveSimilarGridState(IDLE, IDLE, 0)).toBe('empty')
  })

  it('is success when titles are loaded', () => {
    expect(deriveSimilarGridState(IDLE, IDLE, 3)).toBe('success')
  })
})
