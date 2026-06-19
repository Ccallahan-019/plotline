"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMounted } from "@/hooks/use-is-mounted";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  const isDark = resolvedTheme === "dark";

  const icon = isDark ? <Moon /> : <Sun />;

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const tooltipContent = isDark ? "Light Mode" : "Dark Mode";

  if (!isMounted) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        delay={200}
        render={
          <Button
            aria-label="Toggle dark mode"
            onClick={handleToggle}
            size="icon-sm"
            variant="outline"
          >
            {icon}
          </Button>
        }
      />
      <TooltipContent side="bottom">
        <p>{tooltipContent}</p>
      </TooltipContent>
    </Tooltip>
  );
}
