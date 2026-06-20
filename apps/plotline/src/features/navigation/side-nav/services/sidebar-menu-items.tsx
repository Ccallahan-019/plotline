import {
  Bell,
  CalendarCheck2,
  ChartNoAxesCombined,
  ClockFading,
  Compass,
  Globe,
  LayoutDashboard,
  Library,
  ListChecks,
  MonitorPlay,
  Plus,
  Sparkles,
  SquareChartGantt,
  StarHalf,
  StepForward,
  Swords,
  Users,
  UserStar,
} from 'lucide-react'

import type { SidebarMenuItem } from '../types'

export const dashboardItems: SidebarMenuItem[] = [
  {
    href: '/dashboard',
    icon: <LayoutDashboard />,
    id: 'dashboard',
    label: 'Overview',
    type: 'standard',
  },
  {
    href: '/dashboard/continue-watching',
    icon: <StepForward />,
    id: 'dashboard-continue-watching',
    label: 'Continue Watching',
    type: 'standard',
  },
  {
    href: '/dashboard/recent-activity',
    icon: <ClockFading />,
    id: 'dashboard-recent-activity',
    label: 'Recent Activity',
    type: 'standard',
  },
  {
    href: '/dashboard/library',
    icon: <Library />,
    id: 'dashboard-library',
    label: 'Library',
    type: 'standard',
  },
]

export const watchlistsChallengesItems: SidebarMenuItem[] = [
  {
    icon: <ListChecks />,
    id: 'watchlists',
    items: [
      { href: '/dashboard/watchlists', label: 'All Watchlists' },
      { href: '/dashboard/watchlists/watchlist', label: 'Watchlist' },
      {
        href: '/dashboard/watchlists/currently-watching',
        label: 'Currently Watching',
      },
      { href: '/dashboard/watchlists/custom', label: 'Custom Lists' },
      {
        href: '/dashboard/watchlists/new',
        icon: <Plus size={14} stroke="currentColor" />,
        label: 'Create New',
      },
    ],
    label: 'My Watchlists',
    type: 'collapsible',
  },
  {
    icon: <Swords />,
    id: 'challenges',
    items: [
      { href: '/dashboard/challenges/active', label: 'Active Challenges' },
      {
        href: '/dashboard/challenges/completed',
        label: 'Completed Challenges',
      },
      { href: '/dashboard/challenges/overdue', label: 'Overdue' },
      {
        href: '/dashboard/challenges/new',
        icon: <Plus size={14} stroke="currentColor" />,
        label: 'Create New',
      },
    ],
    label: 'Challenges',
    type: 'collapsible',
  },
]

export const reviewsAndRatingsItems: SidebarMenuItem[] = [
  {
    href: '/dashboard/reviews',
    icon: <UserStar />,
    id: 'reviews',
    label: 'All Reviews',
    type: 'standard',
  },
  {
    href: '/dashboard/reviews/rated',
    icon: <StarHalf />,
    id: 'reviews-rated',
    label: 'Rating Only',
    type: 'standard',
  },
  {
    href: '/dashboard/reviews/written',
    icon: <SquareChartGantt />,
    id: 'reviews-written',
    label: 'Written Reviews',
    type: 'standard',
  },
]

export const statsInsightsItems: SidebarMenuItem[] = [
  {
    icon: <ChartNoAxesCombined />,
    id: 'stats-overview',
    items: [
      { href: '/dashboard/stats', label: 'Summary' },
      { href: '/dashboard/stats/history', label: 'Watch History' },
      { href: '/dashboard/stats/by-platform', label: 'By Platform' },
      { href: '/dashboard/stats/rewatches', label: 'Rewatches' },
    ],
    label: 'Overview',
    type: 'collapsible',
  },
  {
    href: `/dashboard/stats/year-in-review`,
    icon: <CalendarCheck2 />,
    id: 'year-in-review',
    label: 'Year in Review',
    type: 'standard',
  },
]

export const discoverItems: SidebarMenuItem[] = [
  {
    icon: <Sparkles />,
    id: 'recommendations',
    items: [
      { href: '/dashboard/discover/for-you', label: 'For You' },
      { href: '/dashboard/discover/similar', label: 'Because You Watched…' },
      { href: '/dashboard/discover/friends', label: 'From Friends' },
    ],
    label: 'Recommendations',
    type: 'collapsible',
  },
  {
    icon: <Globe />,
    id: 'browse',
    items: [
      { href: '/dashboard/search', label: 'Search TMDB' },
      { href: '/dashboard/discover/upcoming', label: 'Upcoming Releases' },
      { href: '/dashboard/discover/trending', label: 'Popular This Week' },
    ],
    label: 'Browse',
    type: 'collapsible',
  },
]

export const alertsAvailabilityItems: SidebarMenuItem[] = [
  {
    icon: <Bell />,
    id: 'release-alerts',
    items: [
      { href: '/dashboard/alerts/following', label: 'Following' },
      { href: '/dashboard/alerts/episodes', label: 'New Episodes' },
      { href: '/dashboard/alerts/releases', label: 'New Seasons & Releases' },
    ],
    label: 'Release Alerts',
    type: 'collapsible',
  },
  {
    icon: <MonitorPlay />,
    id: 'where-to-watch',
    items: [
      { href: '/dashboard/availability', label: 'Available Now' },
      { href: '/dashboard/availability/leaving', label: 'Leaving Soon' },
      { href: '/dashboard/availability/region', label: 'In My Region' },
    ],
    label: 'Where to Watch',
    type: 'collapsible',
  },
]

export const socialItems: SidebarMenuItem[] = [
  {
    icon: <Users />,
    id: 'social-feed',
    items: [
      { href: '/dashboard/social/feed', label: 'Activity Feed' },
      {
        href: '/dashboard/social/friends/activity',
        label: "Friends' Watches",
      },
      {
        href: '/dashboard/social/friends/reviews',
        label: "Friends' Reviews",
      },
    ],
    label: 'Feed',
    type: 'collapsible',
  },
  {
    icon: <Compass />,
    id: 'social-profile',
    items: [
      { href: '/dashboard/profile', label: 'My Public Profile' },
      { href: '/dashboard/social/find', label: 'Find Friends' },
    ],
    label: 'Connect',
    type: 'collapsible',
  },
]
