import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchTmdbGenres } from "@/lib/query/services/api";
import { queryKeys } from "@/lib/query/services/keys";

export function useTmdbGenres() {
  const query = useQuery({
    queryFn: fetchTmdbGenres,
    queryKey: queryKeys.tmdbGenres(),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const genreNameById = useMemo(() => {
    const map = new Map<number, string>();

    for (const genre of query.data?.movie ?? []) {
      map.set(genre.id, genre.name);
    }

    for (const genre of query.data?.tv ?? []) {
      if (!map.has(genre.id)) {
        map.set(genre.id, genre.name);
      }
    }

    return map;
  }, [query.data]);

  const mergedGenres = useMemo(() => {
    const byId = new Map<number, { id: number; name: string }>();

    for (const genre of [...(query.data?.movie ?? []), ...(query.data?.tv ?? [])]) {
      if (!byId.has(genre.id)) {
        byId.set(genre.id, genre);
      }
    }

    return [...byId.values()].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }, [query.data]);

  return {
    ...query,
    genreNameById,
    mergedGenres,
  };
}
