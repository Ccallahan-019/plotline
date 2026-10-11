/** Thrown when TMDB has no title for the requested id. */
export class MediaTitleNotFoundError extends Error {
  constructor() {
    super('Title not found')
    this.name = 'MediaTitleNotFoundError'
  }
}
