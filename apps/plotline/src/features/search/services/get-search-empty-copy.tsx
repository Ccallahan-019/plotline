import { Compass, Search } from 'lucide-react'

import { BrowseMode } from '../types'

export function getSearchEmptyCopy(
  mode: BrowseMode,
  showPrompt: boolean,
  query: string,
): {
  description: string
  icon: React.ReactNode
  title: string
} {
  if (showPrompt) {
    if (mode === 'search') {
      return {
        description: 'Enter at least 2 characters to search TMDB.',
        icon: <Search />,
        title: 'Search by Title',
      }
    }
    return {
      description: 'Browse popular titles by type, or switch to Search to find a specific title.',
      icon: <Compass />,
      title: 'Discover Titles',
    }
  }

  if (mode === 'search' && query) {
    return {
      description: `No titles matched "${query}".`,
      icon: <Search />,
      title: 'No Results Found',
    }
  }

  return {
    description: 'No titles matched the current filters.',
    icon: <Compass />,
    title: 'No Results Found',
  }
}
