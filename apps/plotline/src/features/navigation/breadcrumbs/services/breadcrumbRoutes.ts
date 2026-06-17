import type { SidebarMenuItem } from "@/features/navigation/side-nav/components/SidebarMenu";

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
} from "../../side-nav/services/SidebarMenuItems";

type NavigationSection = {
  items: SidebarMenuItem[];
  section: string;
  sectionHref?: string;
};

const navigationSections: NavigationSection[] = [
  { items: dashboardItems, section: "Dashboard", sectionHref: "/dashboard" },
  { items: byStatusByTypeItems, section: "Library", sectionHref: "/library" },
  {
    items: watchlistsChallengesItems,
    section: "Watchlists",
    sectionHref: "/watchlists",
  },
  {
    items: reviewsAndRatingsItems,
    section: "Reviews & Ratings",
    sectionHref: "/reviews",
  },
  {
    items: getStatsInsightsItems(),
    section: "Stats & Insights",
    sectionHref: "/stats",
  },
  { items: discoverItems, section: "Discover", sectionHref: "/discover/for-you" },
  {
    items: alertsAvailabilityItems,
    section: "Alerts & Availability",
    sectionHref: "/alerts/following",
  },
  { items: socialItems, section: "Social", sectionHref: "/social/feed" },
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
    parentHref: "/watchlists",
    parentLabel: "Watchlists",
    pattern: /^\/watchlists\/([^/]+)$/,
  },
  {
    formatLabel: (value) => value,
    parentHref: "/stats",
    parentLabel: "Summary",
    pattern: /^\/stats\/year\/(\d+)$/,
  },
];

export function formatSlugLabel(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
