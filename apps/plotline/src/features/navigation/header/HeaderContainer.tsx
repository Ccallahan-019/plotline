import { PropsWithChildren } from "react";

export function HeaderContainer({ children }: PropsWithChildren) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 items-center justify-between px-4">
        {children}
      </div>
    </header>
  );
}
