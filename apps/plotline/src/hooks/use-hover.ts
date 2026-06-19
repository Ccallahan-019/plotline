import { useCallback, useEffect, useState } from "react";

export function useHover<T extends HTMLElement = HTMLElement>() {
  const [isHovered, setIsHovered] = useState(false);
  const [node, setNode] = useState<null | T>(null);

  const ref = useCallback((element: null | T) => {
    setNode(element);
  }, []);

  useEffect(() => {
    if (!node) {
      return;
    }

    const onMouseEnter = () => setIsHovered(true);
    const onMouseLeave = () => setIsHovered(false);

    node.addEventListener("mouseenter", onMouseEnter);
    node.addEventListener("mouseleave", onMouseLeave);

    return () => {
      node.removeEventListener("mouseenter", onMouseEnter);
      node.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [node]);

  return [ref, isHovered] as const;
}
