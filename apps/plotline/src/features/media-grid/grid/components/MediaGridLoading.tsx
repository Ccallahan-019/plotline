import { MediaGridContainer } from './MediaGridContainer'
import { MediaGridItemLoading } from './MediaGridItemLoading'

export function MediaGridLoading() {
  return (
    <MediaGridContainer>
      {Array.from({ length: 20 }).map((_, index) => (
        <MediaGridItemLoading key={index} ratio={2 / 3} />
      ))}
    </MediaGridContainer>
  )
}
