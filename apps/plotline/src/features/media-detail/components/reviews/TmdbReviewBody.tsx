import type { ReactNode } from 'react'
import type { Components } from 'react-markdown'
import type { Options as ReviewHtmlSchema } from 'rehype-sanitize'

import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkBreaks from 'remark-breaks'

const REVIEW_MARKDOWN_ELEMENTS = [
  'b',
  'blockquote',
  'br',
  'code',
  'em',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'strong',
  'ul',
] as const

// Tags not listed here are unwrapped to their text. `strip` drops the element and its contents.
const reviewHtmlSchema = {
  attributes: {
    img: ['alt'],
  },
  protocols: {},
  required: {},
  strip: ['embed', 'form', 'iframe', 'noscript', 'object', 'script', 'style', 'textarea'],
  tagNames: [...REVIEW_MARKDOWN_ELEMENTS],
} satisfies ReviewHtmlSchema

const reviewMarkdownComponents: Components = {
  blockquote: ReviewQuote,
  code: ReviewCode,
  img: ReviewImage,
  li: ReviewListItem,
  ol: ReviewOrderedList,
  p: ReviewParagraph,
  ul: ReviewList,
}

type TmdbReviewBodyProps = {
  body: string
}

export function TmdbReviewBody({ body }: TmdbReviewBodyProps) {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed wrap-break-word text-pretty">
      <Markdown
        allowedElements={[...REVIEW_MARKDOWN_ELEMENTS]}
        components={reviewMarkdownComponents}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, reviewHtmlSchema]]}
        // Single newlines stay line breaks. TMDB reviews are written like plain text.
        remarkPlugins={[remarkBreaks]}
        unwrapDisallowed
        // Links are not rendered. Clear any URL that survives sanitation.
        urlTransform={() => ''}
      >
        {body}
      </Markdown>
    </div>
  )
}

function ReviewCode({ children }: { children?: ReactNode }) {
  return (
    <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.85em] whitespace-pre-wrap">
      {children}
    </code>
  )
}

function ReviewImage({ alt }: { alt?: string }) {
  // Alt text stays. The image URL is not loaded.
  if (!alt) {
    return null
  }

  return <span>{alt}</span>
}

function ReviewList({ children }: { children?: ReactNode }) {
  return <ul className="m-0 list-disc pl-5">{children}</ul>
}

function ReviewListItem({ children }: { children?: ReactNode }) {
  return <li className="pl-1">{children}</li>
}

function ReviewOrderedList({ children }: { children?: ReactNode }) {
  return <ol className="m-0 list-decimal pl-5">{children}</ol>
}

function ReviewParagraph({ children }: { children?: ReactNode }) {
  return <p className="m-0">{children}</p>
}

function ReviewQuote({ children }: { children?: ReactNode }) {
  return (
    <blockquote className="m-0 flex flex-col gap-2 border-l-2 border-border pl-3 text-muted-foreground">
      {children}
    </blockquote>
  )
}
