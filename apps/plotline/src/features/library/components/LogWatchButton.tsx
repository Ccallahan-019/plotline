import { Media } from "@plotline/payload-types";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getMediaId } from "@/features/media/services/media-display";
import { useLogWatch } from "@/lib/query/hooks/use-log-watch";

type LogWatchButtonProps = {
  media: Media;
};

export function LogWatchButton({ media }: LogWatchButtonProps) {
  const logWatchMutation = useLogWatch();

  const handleLogWatch = () => {
    logWatchMutation.mutate({
      eventType: "completed",
      libraryItemStatus: "completed",
      mediaId: getMediaId(media),
    });
  };

  const isPending = logWatchMutation.isPending;

  const buttonAddon = isPending ? <Spinner /> : <Check />;

  return (
    <Button
      disabled={isPending}
      onClick={handleLogWatch}
      size="sm"
      variant="outline"
    >
      {buttonAddon}
      Log watch
    </Button>
  );
}
