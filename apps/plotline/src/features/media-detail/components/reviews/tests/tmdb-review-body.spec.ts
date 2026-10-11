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

  it('keeps the label of a markdown link with a script URL and drops the URL', () => {
    const html = renderBody('[click me](javascript:alert(1))')

    expect(html).toContain('click me')
    expect(html).not.toContain('<a')
    expect(html).not.toContain('javascript')
  })

  it('renders lists, quotes and inline code, and keeps single newlines as breaks', () => {
    const html = renderBody(
      ['- one', '- two', '', '> quoted', '', 'a `code` span', 'next line'].join('\n'),
    )

    expect(html).toContain('<ul')
    expect(html).toContain('<li')
    expect(html).toContain('<blockquote')
    expect(html).toContain('<code')
    expect(html).toContain('<br/>')
  })

  it('renders an image without alt text as nothing', () => {
    const html = renderBody('before <img src="https://evil.example/p.png"> after')

    expect(html).toContain('before')
    expect(html).toContain('after')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('evil.example')
  })
})
