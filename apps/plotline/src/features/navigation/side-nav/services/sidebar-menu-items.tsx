import {
  Bell,
  CalendarCheck2,
  ChartNoAxesCombined,
  ClipboardClock,
  ClockFading,
  Compass,
  Globe,
  LayoutDashboard,
  ListChecks,
  MonitorCog,
  MonitorPlay,
  Plus,
  Sparkles,
  SquareChartGantt,
  StarHalf,
  StepForward,
  Swords,
  Users,
  UserStar,
} from "lucide-react";

import type { SidebarMenuItem } from "../types";

export const dashboardItems: SidebarMenuItem[] = [
  {
    href: "/dashboard",
    icon: <LayoutDashboard />,
    id: "dashboard",
    label: "Overview",
    type: "standard",
  },
  {
    href: "/dashboard/continue-watching",
    icon: <StepForward />,
    id: "dashboard-continue-watching",
    label: "Continue Watching",
    type: "standard",
  },
  {
    href: "/dashboard/recent-activity",
    icon: <ClockFading />,
    id: "dashboard-recent-activity",
    label: "Recent Activity",
    type: "standard",
  },
];

export const byStatusByTypeItems: SidebarMenuItem[] = [
  {
    icon: <ClipboardClock />,
    id: "by-status",
    items: [
      { href: "/library", label: "All Titles" },
      { href: "/library/planned", label: "Planned" },
      { href: "/library/watching", label: "Currently Watching" },
      { href: "/library/completed", label: "Completed" },
      { href: "/library/on-hold", label: "On Hold" },
      { href: "/library/dropped", label: "Dropped" },
    ],
    label: "By Status",
    type: "collapsible",
  },
  {
    icon: <MonitorCog />,
    id: "by-type",
    items: [
      { href: "/library/movies", label: "Movies" },
      { href: "/library/tv", label: "TV Shows" },
    ],
    label: "By Type",
    type: "collapsible",
  },
];

export const watchlistsChallengesItems: SidebarMenuItem[] = [
  {
    icon: <ListChecks />,
    id: "watchlists",
    items: [
      { href: "/watchlists", label: "All Watchlists" },
      { href: "/watchlists/watchlist", label: "Watchlist" },
      { href: "/watchlists/currently-watching", label: "Currently Watching" },
      { href: "/watchlists/custom", label: "Custom Lists" },
      {
        href: "/watchlists/new",
        icon: <Plus size={14} stroke="currentColor" />,
        label: "Create New",
      },
    ],
    label: "My Watchlists",
    type: "collapsible",
  },
  {
    icon: <Swords />,
    id: "challenges",
    items: [
      { href: "/challenges/active", label: "Active Challenges" },
      { href: "/challenges/completed", label: "Completed Challenges" },
      { href: "/challenges/overdue", label: "Overdue" },
      {
        href: "/challenges/new",
        icon: <Plus size={14} stroke="currentColor" />,
        label: "Create New",
      },
    ],
    label: "Challenges",
    type: "collapsible",
  },
];

export const reviewsAndRatingsItems: SidebarMenuItem[] = [
  {
    href: "/reviews",
    icon: <UserStar />,
    id: "reviews",
    label: "All Reviews",
    type: "standard",
  },
  {
    href: "/reviews/rated",
    icon: <StarHalf />,
    id: "reviews-rated",
    label: "Rating Only",
    type: "standard",
  },
  {
    href: "/reviews/written",
    icon: <SquareChartGantt />,
    id: "reviews-written",
    label: "Written Reviews",
    type: "standard",
  },
];

export const getStatsInsightsItems = (): SidebarMenuItem[] => {
  const currentYear = new Date().getFullYear();

  return [
    {
      icon: <ChartNoAxesCombined />,
      id: "stats-overview",
      items: [
        { href: "/stats", label: "Summary" },
        { href: "/stats/history", label: "Watch History" },
        { href: "/stats/by-platform", label: "By Platform" },
        { href: "/stats/rewatches", label: "Rewatches" },
      ],
      label: "Overview",
      type: "collapsible",
    },
    {
      icon: <CalendarCheck2 />,
      id: "year-in-review",
      items: [
        { href: `/stats/year/${currentYear}`, label: `${currentYear}` },
        { href: "/stats/year/all", label: "All Time" },
        { href: "/stats/year/share", label: "Share & Export" },
      ],
      label: "Year in Review",
      type: "collapsible",
    },
  ];
};

export const discoverItems: SidebarMenuItem[] = [
  {
    icon: <Sparkles />,
    id: "recommendations",
    items: [
      { href: "/discover/for-you", label: "For You" },
      { href: "/discover/similar", label: "Because You Watched…" },
      { href: "/discover/friends", label: "From Friends" },
    ],
    label: "Recommendations",
    type: "collapsible",
  },
  {
    icon: <Globe />,
    id: "browse",
    items: [
      { href: "/search", label: "Search TMDB" },
      { href: "/discover/upcoming", label: "Upcoming Releases" },
      { href: "/discover/trending", label: "Popular This Week" },
    ],
    label: "Browse",
    type: "collapsible",
  },
];

export const alertsAvailabilityItems: SidebarMenuItem[] = [
  {
    icon: <Bell />,
    id: "release-alerts",
    items: [
      { href: "/alerts/following", label: "Following" },
      { href: "/alerts/episodes", label: "New Episodes" },
      { href: "/alerts/releases", label: "New Seasons & Releases" },
    ],
    label: "Release Alerts",
    type: "collapsible",
  },
  {
    icon: <MonitorPlay />,
    id: "where-to-watch",
    items: [
      { href: "/availability", label: "Available Now" },
      { href: "/availability/leaving", label: "Leaving Soon" },
      { href: "/availability/region", label: "In My Region" },
    ],
    label: "Where to Watch",
    type: "collapsible",
  },
];

export const socialItems: SidebarMenuItem[] = [
  {
    icon: <Users />,
    id: "social-feed",
    items: [
      { href: "/social/feed", label: "Activity Feed" },
      { href: "/social/friends/activity", label: "Friends' Watches" },
      { href: "/social/friends/reviews", label: "Friends' Reviews" },
    ],
    label: "Feed",
    type: "collapsible",
  },
  {
    icon: <Compass />,
    id: "social-profile",
    items: [
      { href: "/profile", label: "My Public Profile" },
      { href: "/social/find", label: "Find Friends" },
    ],
    label: "Connect",
    type: "collapsible",
  },
];
