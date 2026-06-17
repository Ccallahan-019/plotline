export function isLinkActive(href: string, pathname: string) {
  if (href === "/" || href === "/dashboard") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}
