'use client'

import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'

import { cn } from '@/lib/utils'

const DrawerModalContext = React.createContext(true)

function Drawer({ modal = true, ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return (
    <DrawerModalContext.Provider value={modal}>
      <DrawerPrimitive.Root data-slot="drawer" modal={modal} {...props} />
    </DrawerModalContext.Provider>
  )
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerContent({
  children,
  className,
  onPointerDownOutside,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  const modal = React.useContext(DrawerModalContext)
  useDrawerScrollLock(!modal)

  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        className={cn(
          'group/drawer-content fixed z-50 flex h-auto flex-col bg-popover text-sm text-popover-foreground data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-xl data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-r-xl data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-l-xl data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-xl data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm',
          className,
        )}
        data-slot="drawer-content"
        {...props}
        onPointerDownOutside={(event) => {
          onPointerDownOutside?.(event)

          if (isPortaledLayerTarget(event.target)) {
            event.preventDefault()
          }
        }}
      >
        <div className="mx-auto mt-4 hidden h-1 w-25 shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      data-slot="drawer-description"
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      data-slot="drawer-footer"
      {...props}
    />
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-0.5 md:text-left',
        className,
      )}
      data-slot="drawer-header"
      {...props}
    />
  )
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  const modal = React.useContext(DrawerModalContext)
  const overlayClassName = cn(
    'fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
    className,
  )

  // Vaul renders no overlay when `modal` is false, which is what lets portaled
  // popups receive clicks and focus. This stand-in still dismisses the drawer.
  if (!modal) {
    return (
      <DrawerPrimitive.Close asChild>
        <div aria-hidden className={overlayClassName} data-slot="drawer-overlay" />
      </DrawerPrimitive.Close>
    )
  }

  return (
    <DrawerPrimitive.Overlay className={overlayClassName} data-slot="drawer-overlay" {...props} />
  )
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      className={cn('font-heading text-base font-medium text-foreground', className)}
      data-slot="drawer-title"
      {...props}
    />
  )
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

const PORTED_LAYER_SELECTOR = [
  '[data-slot="combobox-content"]',
  '[data-slot="dialog-content"]',
  '[data-slot="dialog-overlay"]',
  '[data-slot="dropdown-menu-content"]',
  '[data-slot="dropdown-menu-sub-content"]',
  '[data-slot="popover-content"]',
  '[data-slot="select-content"]',
].join(', ')

// True when the outside press landed on a popup portaled outside the drawer.
function isPortaledLayerTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest(PORTED_LAYER_SELECTOR) != null
}

/**
 * Locks document scroll while a non-modal drawer is open.
 *
 * Vaul only scroll-locks modal drawers. Non-modal is required so portaled popups
 * can be clicked and focused.
 *
 * @param enabled - When false, body overflow is left unchanged
 */
function useDrawerScrollLock(enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) {
      return
    }

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    return () => {
      body.style.overflow = previousOverflow
    }
  }, [enabled])
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
}
