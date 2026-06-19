import { useOpenState } from "@/providers/OpenStateProvider";

export function useAddToLibraryPopover() {
  const { isOpen, setIsOpen } = useOpenState();

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
  };

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const handleTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return {
    handleContentClick,
    handleOpenChange,
    handleSuccess,
    handleTriggerClick,
    isOpen,
  };
}
