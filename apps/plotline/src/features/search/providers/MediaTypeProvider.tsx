"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";

import {
  DEFAULT_SEARCH_MEDIA_TYPE,
  type SearchMediaType,
} from "../types";

type MediaTypeContextValue = {
  mediaType: SearchMediaType;
  setMediaType: (mediaType: SearchMediaType) => void;
};

const MediaTypeContext = createContext<MediaTypeContextValue | null>(null);

export function MediaTypeProvider({ children }: PropsWithChildren) {
  const [mediaType, setMediaTypeState] = useState<SearchMediaType>(
    DEFAULT_SEARCH_MEDIA_TYPE,
  );

  const setMediaType = useCallback((nextMediaType: SearchMediaType) => {
    setMediaTypeState(nextMediaType);
  }, []);

  return (
    <MediaTypeContext.Provider value={{ mediaType, setMediaType }}>
      {children}
    </MediaTypeContext.Provider>
  );
}

export function useMediaType() {
  const context = useContext(MediaTypeContext);

  if (!context) {
    throw new Error("useMediaType must be used within a MediaTypeProvider");
  }

  return context;
}
