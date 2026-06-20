import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

import {
  alertsAvailabilityItems,
  dashboardItems,
  discoverItems,
  getStatsInsightsItems,
  reviewsAndRatingsItems,
  socialItems,
  watchlistsChallengesItems,
} from '../services/sidebar-menu-items'
import { SidebarLogo } from './SidebarLogo'
import { SidebarMenu } from './SidebarMenu'
import { UserProfileButton } from './UserProfileButton'

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="pt-2 px-0.5">
          <UserProfileButton />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu items={dashboardItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Watchlists</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu items={watchlistsChallengesItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reviews & Ratings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu items={reviewsAndRatingsItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Stats & Insights</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu items={getStatsInsightsItems()} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Discover</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu items={discoverItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Alerts & Availability</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu items={alertsAvailabilityItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Social</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu items={socialItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-1 flex items-center justify-center">
          <SidebarLogo />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
