export type BreadcrumbRoute = {
  groupLabel?: string;
  label: string;
  section?: string;
  sectionHref?: string;
};

export type BreadcrumbSegment = {
  href?: string;
  kind?: "overview";
  label: string;
};
