"use client";

import { usePathname } from "next/navigation";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ShowIf } from "@/components/utils/ShowIf";

import { getBreadcrumbs } from "../services/get-breadcrumbs";
import { BreadcrumbItemContent } from "./BreadcrumbItemContent";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = getBreadcrumbs(pathname);

  if (segments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <Fragment key={`${segment.label}-${index}`}>
              <ShowIf condition={index > 0}>
                <BreadcrumbSeparator />
              </ShowIf>
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbItemContent breadcrumb={segment} isLast={isLast} />
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
