import { PropsWithChildren } from "react";

type ShowIfProps = PropsWithChildren<{
  condition: boolean;
}>;

export function ShowIf({ children, condition }: ShowIfProps) {
  if (!condition) return null;
  return children;
}
