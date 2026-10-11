'use client'

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'

import {
  clearTitleBreadcrumbParent,
  clearTitleBreadcrumbParentIf,
  type TitleBreadcrumbParent,
  writeTitleBreadcrumbParent,
} from '../services/title-breadcrumb-parent'

type TitleBreadcrumbParentContextValue = {
  /** Tells the provider a title link under it was used, so the parent must outlive the list. */
  markOpened: () => void
  parent: TitleBreadcrumbParent
}

const TitleBreadcrumbParentContext = createContext<null | TitleBreadcrumbParentContextValue>(null)

type TitleBreadcrumbParentProviderProps = PropsWithChildren<TitleBreadcrumbParent>

/**
 * Names the list page that wraps its title links, so the title page can show it as the parent crumb.
 *
 * Writes that parent as soon as the list is on screen. Openings that never run a click
 * handler, such as the context menu's "Open in new tab", clone session storage from the
 * current tab, so they need the parent stored before the click. Click handlers still
 * record the list that was actually used, and clear it when a title link sits outside
 * this provider. When the list unmounts without any of its title links having been used,
 * it withdraws its own entry, so a title opened later from somewhere else falls back to
 * Library instead of naming a list the user only passed through.
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
  const openedRef = useRef(false)
  const value = useMemo(
    () => ({
      markOpened: () => {
        openedRef.current = true
      },
      parent,
    }),
    [parent],
  )

  useEffect(() => {
    const opened = openedRef
    opened.current = false
    writeTitleBreadcrumbParent(parent)

    return () => {
      if (!opened.current) {
        clearTitleBreadcrumbParentIf(parent)
      }
    }
  }, [parent])

  return (
    <TitleBreadcrumbParentContext.Provider value={value}>
      {children}
    </TitleBreadcrumbParentContext.Provider>
  )
}

/**
 * Link handlers that record where a title link was opened from.
 *
 * The wrapping list already stores its parent on mount. These handlers still run on
 * click and middle-click: they tell the list the parent must survive its unmount, and a
 * link outside `TitleBreadcrumbParentProvider` clears the stored parent so the title page
 * falls back to Library.
 *
 * @returns Props to spread onto the title `Link`
 */
export function useTitleBreadcrumbLinkProps() {
  const context = useContext(TitleBreadcrumbParentContext)

  return useMemo(() => {
    const remember = () => {
      if (context) {
        context.markOpened()
        writeTitleBreadcrumbParent(context.parent)
        return
      }

      clearTitleBreadcrumbParent()
    }

    return { onAuxClick: remember, onClick: remember }
  }, [context])
}
