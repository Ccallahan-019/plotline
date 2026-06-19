import {
  Status,
  StatusBadge,
} from "@/features/library/components/library-list/StatusBadge";
import { cn } from "@/lib/utils";

type LibraryPosterStatusBadgeProps = {
  animationKey?: string;
  className?: string;
  status: Status;
  triggerAnimation?: boolean;
};

export function LibraryPosterStatusBadge({
  animationKey,
  className,
  status,
  triggerAnimation = false,
}: LibraryPosterStatusBadgeProps) {
  return (
    <div className={cn("pointer-events-none", className)}>
      <StatusBadge
        animationKey={animationKey}
        className="shadow-sm h-7 rounded-md"
        status={status}
        triggerAnimation={triggerAnimation}
      />
    </div>
  );
}
