import { Status, StatusBadge } from "@/features/library/components/StatusBadge";
import { cn } from "@/lib/utils";

type LibraryPosterStatusBadgeProps = {
  className?: string;
  status: Status;
};

export function LibraryPosterStatusBadge({
  className,
  status,
}: LibraryPosterStatusBadgeProps) {
  return (
    <div className={cn("pointer-events-none", className)}>
      <StatusBadge
        className="shadow-sm h-7 gap-1.5 rounded-md"
        status={status}
      />
    </div>
  );
}
