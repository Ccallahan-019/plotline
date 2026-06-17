import type { SidebarMenuItem } from "@/features/navigation/side-nav/types";

import type { BreadcrumbRoute } from "../types";

import {
  alertsAvailabilityItems,
  byStatusByTypeItems,
  dashboardItems,
  discoverItems,
  getStatsInsightsItems,
  reviewsAndRatingsItems,
  socialItems,
  watchlistsChallengesItems,
} from "../../side-nav/services/sidebar-menu-items";

type NavigationSection = {
  items: SidebarMenuItem[];
  section: string;
  sectionHref?: string;
};

const navigationSections: NavigationSection[] = [
  { items: dashboardItems, section: "Dashboard", sectionHref: "/dashboard" },
  { items: byStatusByTypeItems, section: "Library", sectionHref: "/dashboard/library" },
  {
    items: watchlistsChallengesItems,
    section: "Watchlists",
    sectionHref: "/dashboard/watchlists",
  },
  {
    items: reviewsAndRatingsItems,
    section: "Reviews & Ratings",
    sectionHref: "/dashboard/reviews",
  },
  {
    items: getStatsInsightsItems(),
    section: "Stats & Insights",
    sectionHref: "/dashboard/stats",
  },
  {
    items: discoverItems,
    section: "Discover",
    sectionHref: "/dashboard/discover/for-you",
  },
  {
    items: alertsAvailabilityItems,
    section: "Alerts & Availability",
    sectionHref: "/dashboard/alerts/following",
  },
  { items: socialItems, section: "Social", sectionHref: "/dashboard/social/feed" },
];

function getFirstHref(items: SidebarMenuItem[]): string | undefined {
  for (const item of items) {
    if (item.type === "standard") {
      return item.href;
    }

    const childHref = item.items[0]?.href;
    if (childHref) {
      return childHref;
    }
  }

  return undefined;
}

function registerSectionRoutes(
  map: Map<string, BreadcrumbRoute>,
  section: NavigationSection,
) {
  const sectionHref = section.sectionHref ?? getFirstHref(section.items);

  for (const item of section.items) {
    if (item.type === "standard") {
      map.set(item.href, {
        label: item.label,
        section: section.section,
        sectionHref,
      });
      continue;
    }

    for (const child of item.items) {
      map.set(child.href, {
        groupLabel: item.label,
        label: child.label,
        section: section.section,
        sectionHref,
      });
    }
  }
}

export const breadcrumbRouteMap = (() => {
  const map = new Map<string, BreadcrumbRoute>();

  for (const section of navigationSections) {
    registerSectionRoutes(map, section);
  }

  return map;
})();

export const dynamicBreadcrumbRoutes: {
  formatLabel: (value: string) => string;
  parentHref: string;
  parentLabel: string;
  pattern: RegExp;
}[] = [
  {
    formatLabel: formatSlugLabel,
    parentHref: "/dashboard/watchlists",
    parentLabel: "Watchlists",
    pattern: /^\/dashboard\/watchlists\/([^/]+)$/,
  },
  {
    formatLabel: (value) => value,
    parentHref: "/dashboard/stats",
    parentLabel: "Summary",
    pattern: /^\/dashboard\/stats\/year\/(\d+)$/,
  },
];

export function formatSlugLabel(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
