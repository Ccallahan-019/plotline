import Image from 'next/image'
import Link from 'next/link'

export function SidebarLogo() {
  return (
    <Link
      className="flex w-full items-center justify-center gap-2 pr-3 group-data-[collapsible=icon]:hidden"
      href="/"
    >
      <Image
        alt="Plotline"
        className="h-[25px] w-auto shrink-0 truncate"
        height={25}
        src="/icon.png"
        width={35}
      />
      <span className="text-lg font-medium truncate">Plotline</span>
    </Link>
  )
}
