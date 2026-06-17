export class FetchJsonError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message)
    this.name = 'FetchJsonError'
  }
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)

  if (!response.ok) {
    let body: unknown

    try {
      body = await response.json()
    } catch {
      body = await response.text()
    }

    throw new FetchJsonError(
      `Request failed: ${response.status} ${response.statusText}`,
      response.status,
      body,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
