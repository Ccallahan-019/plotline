import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { MediaTitleWatchEvent } from '../../types'

import { formatEpisodeRuntime } from '../../services/format-media-season'
import {
  formatWatchActivityDate,
  formatWatchActivityLabel,
  formatWatchActivityPlatform,
} from '../../services/format-media-title'
import { MediaActivityEmpty } from './MediaActivityEmpty'

type MediaActivityTabProps = {
  watchEvents: MediaTitleWatchEvent[]
}

export function MediaActivityTab({ watchEvents }: MediaActivityTabProps) {
  if (watchEvents.length === 0) {
    return <MediaActivityEmpty />
  }

  return (
    <div className="overflow-hidden border rounded-md">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="uppercase tracking-wide text-xs">Activity Type</TableHead>
            <TableHead className="uppercase tracking-wide text-xs">Platform</TableHead>
            <TableHead className="uppercase tracking-wide text-xs">Watched On</TableHead>
            <TableHead className="text-right uppercase tracking-wide text-xs">Runtime</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchEvents.map((event) => {
            const platformLabel = formatWatchActivityPlatform(event)
            const runtimeLabel = formatEpisodeRuntime(event.runtimeMinutes)

            return (
              <TableRow key={event.id}>
                <TableCell>{formatWatchActivityLabel(event)}</TableCell>
                <TableCell>{platformLabel ?? '-'}</TableCell>
                <TableCell>{formatWatchActivityDate(event.watchedAt)}</TableCell>
                <TableCell className="text-right">{runtimeLabel ?? '-'}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
