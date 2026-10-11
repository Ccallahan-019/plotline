import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'

import { MediaTitlePage } from '@/features/media-detail/components/MediaTitlePage'
import { getMediaTitlePage } from '@/features/media-detail/services/get-media-title'
import { MediaTitleNotFoundError } from '@/features/media-detail/services/media-title-errors'
import { parseMediaTitleParams } from '@/features/media-detail/services/parse-media-title-params'

type TitlePageProps = {
  params: Promise<{ mediaType: string; tmdbId: string }>
}

export async function generateMetadata({ params }: TitlePageProps) {
  const { mediaType, tmdbId } = await params
  const parsed = parseMediaTitleParams(mediaType, tmdbId)
  const { userId } = await auth()

  if (!userId || !parsed) {
    return { title: 'Title' }
  }

  try {
    const data = await getMediaTitlePage(userId, parsed.mediaType, parsed.tmdbId)

    return { title: data.media.title }
  } catch {
    return { title: 'Title' }
  }
}

export default async function TitlePage({ params }: TitlePageProps) {
  const { mediaType, tmdbId } = await params
  const parsed = parseMediaTitleParams(mediaType, tmdbId)
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  if (!parsed) {
    notFound()
  }

  try {
    const data = await getMediaTitlePage(userId, parsed.mediaType, parsed.tmdbId)

    return (
      <MediaTitlePage initialData={data} mediaType={parsed.mediaType} tmdbId={parsed.tmdbId} />
    )
  } catch (error) {
    if (error instanceof MediaTitleNotFoundError) {
      notFound()
    }

    throw error
  }
}
