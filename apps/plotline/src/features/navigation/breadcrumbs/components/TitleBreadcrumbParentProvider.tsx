'use client'

import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react'

import {
  clearTitleBreadcrumbParent,
  type TitleBreadcrumbParent,
  writeTitleBreadcrumbParent,
} from '../services/title-breadcrumb-parent'

const TitleBreadcrumbParentContext = createContext<null | TitleBreadcrumbParent>(null)

type TitleBreadcrumbParentProviderProps = PropsWithChildren<TitleBreadcrumbParent>

/**
 * Names the list page that wraps its title links, so the title page can show it as the parent crumb.
 *
 * Writes that parent as soon as the list is on screen. Openings that never run a click
 * handler, such as the context menu's "Open in new tab", clone session storage from the
 * current tab, so they need the parent stored before the click. Click handlers still
 * record the list that was actually used, and clear it when a title link sits outside
 * this provider.
 *
 * @param props.href - Path of the list page
 * @param props.label - Crumb text for the list page
 */
export function TitleBreadcrumbParentProvider({
  children,
  href,
  label,
}: TitleBreadcrumbParentProviderProps) {
  const parent = useMemo(() => ({ href, label }), [href, label])

  useEffect(() => {
    writeTitleBreadcrumbParent(parent)
  }, [parent])

  return (
    <TitleBreadcrumbParentContext.Provider value={parent}>
      {children}
    </TitleBreadcrumbParentContext.Provider>
  )
}

/**
 * Link handlers that record where a title link was opened from.
 *
 * The wrapping list already stores its parent on mount. These handlers still run on
 * click and middle-click so a link outside `TitleBreadcrumbParentProvider` clears that
 * stored parent and the title page falls back to Library.
 *
 * @returns Props to spread onto the title `Link`
 */
export function useTitleBreadcrumbLinkProps() {
  const parent = useContext(TitleBreadcrumbParentContext)

  return useMemo(() => {
    const remember = () => {
      if (parent) {
        writeTitleBreadcrumbParent(parent)
        return
      }

      clearTitleBreadcrumbParent()
    }

    return { onAuxClick: remember, onClick: remember }
  }, [parent])
}
