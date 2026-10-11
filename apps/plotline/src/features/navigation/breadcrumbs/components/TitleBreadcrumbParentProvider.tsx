'use client'

import { createContext, type PropsWithChildren, useContext, useMemo } from 'react'

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
 * @param props.href - Path of the list page
 * @param props.label - Crumb text for the list page
 */
export function TitleBreadcrumbParentProvider({
  children,
  href,
  label,
}: TitleBreadcrumbParentProviderProps) {
  const parent = useMemo(() => ({ href, label }), [href, label])

  return (
    <TitleBreadcrumbParentContext.Provider value={parent}>
      {children}
    </TitleBreadcrumbParentContext.Provider>
  )
}

/**
 * Link handlers that record where a title link was opened from.
 *
 * Fires on click and middle-click, so the title page reads the list that was actually
 * used. A link rendered outside a `TitleBreadcrumbParentProvider` clears the stored
 * parent, so the title page falls back to Library rather than a list visited earlier.
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
