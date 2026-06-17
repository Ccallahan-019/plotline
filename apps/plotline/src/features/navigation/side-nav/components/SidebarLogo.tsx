import Image from "next/image";
import Link from "next/link";

export function SidebarLogo() {
  return (
    <Link href="/">
      <div className="flex shrink-0 items-center gap-2 pr-3">
        <Image
          alt="Plotline"
          className="h-[25px] w-auto"
          height={25}
          src="/icon.png"
          width={35}
        />
        <span className="text-lg font-medium">Plotline</span>
      </div>
    </Link>
  );
}
