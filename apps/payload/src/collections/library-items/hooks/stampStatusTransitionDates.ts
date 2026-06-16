import type { CollectionBeforeChangeHook } from 'payload'

export const stampStatusTransitionDates: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (!data) {
    return data
  }

  const previousStatus = originalDoc?.status
  const nextStatus = data.status ?? previousStatus

  if (nextStatus === 'watching' && previousStatus !== 'watching' && !data.startedAt) {
    data.startedAt = new Date().toISOString()
  }

  if (nextStatus === 'completed' && previousStatus !== 'completed' && !data.completedAt) {
    data.completedAt = new Date().toISOString()
  }

  return data
}
