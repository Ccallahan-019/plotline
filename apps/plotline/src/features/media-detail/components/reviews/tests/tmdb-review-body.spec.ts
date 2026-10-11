import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TmdbReviewBody } from '../TmdbReviewBody'

function renderBody(body: string): string {
  return renderToStaticMarkup(createElement(TmdbReviewBody, { body }))
}

describe('TmdbReviewBody', () => {
  it('renders markdown and safe HTML without links or scripts', () => {
    const html = renderBody(
      [
        '**Bold** and <em>emphasis</em> and <i>slant</i>',
        '[label](https://evil.example/phish)',
        '<a href="javascript:alert(1)">kept label</a>',
        '<script>alert(1)</script>',
        '<img src="https://evil.example/pixel.png" alt="poster" onerror="alert(1)">',
      ].join('\n\n'),
    )

    expect(html).toContain('<strong>Bold</strong>')
    expect(html).toContain('<em>emphasis</em>')
    expect(html).toContain('<i>slant</i>')
    expect(html).toContain('label')
    expect(html).toContain('kept label')
    expect(html).toContain('poster')
    expect(html).not.toContain('<a')
    expect(html).not.toContain('href')
    expect(html).not.toContain('evil.example')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('alert(1)')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('onerror')
  })
})
