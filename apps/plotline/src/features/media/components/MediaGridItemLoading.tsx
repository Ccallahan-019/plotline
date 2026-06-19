import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Item, ItemContent, ItemHeader } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

type MediaGridItemLoadingProps = {
  ratio: number;
};

export function MediaGridItemLoading({ ratio }: MediaGridItemLoadingProps) {
  return (
    <Item className="overflow-hidden p-0 items-start">
      <ItemHeader>
        <AspectRatio
          className="w-full relative bg-muted rounded-md"
          ratio={ratio}
        />
      </ItemHeader>
      <ItemContent>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </ItemContent>
    </Item>
  );
}
