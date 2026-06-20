import 'server-only'

export type PayloadPaginatedDocs<T> = {
  docs: T[]
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
  nextPage: null | number
  page: number
  pagingCounter: number
  prevPage: null | number
  totalDocs: number
  totalPages: number
}

type PayloadFetchOptions = {
  body?: unknown
  clerkUserId: string
  searchParams?: Record<string, number | string | undefined>
} & Omit<RequestInit, 'body'>

export class PayloadClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message)
    this.name = 'PayloadClientError'
  }
}

export async function payloadFetch<T>(
  path: string,
  { body, clerkUserId, headers, searchParams, ...init }: PayloadFetchOptions,
): Promise<T> {
  const { apiKey, baseUrl } = getPayloadConfig()
  const url = new URL(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`)

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const requestHeaders = new Headers(headers)
  requestHeaders.set('Authorization', `Bearer ${apiKey}`)
  requestHeaders.set('x-clerk-user-id', clerkUserId)

  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...init,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
    headers: requestHeaders,
  })

  if (!response.ok) {
    let errorBody: unknown

    try {
      errorBody = await response.json()
    } catch {
      errorBody = await response.text()
    }

    throw new PayloadClientError(
      `Payload request failed: ${response.status} ${response.statusText}`,
      response.status,
      errorBody,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

function getPayloadConfig() {
  const baseUrl = process.env.PAYLOAD_URL
  const apiKey = process.env.PAYLOAD_API_KEY

  if (!baseUrl) {
    throw new Error('PAYLOAD_URL is not configured')
  }

  if (!apiKey) {
    throw new Error('PAYLOAD_API_KEY is not configured')
  }

  return { apiKey, baseUrl: baseUrl.replace(/\/$/, '') }
}
