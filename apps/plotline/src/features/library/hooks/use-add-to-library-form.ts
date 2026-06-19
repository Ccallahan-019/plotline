"use client";

import type { LibraryItem, WatchlistMembership } from "@plotline/payload-types";
import type { MediaStatus } from "@plotline/shared/constants/media";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { MediaDisplay } from "@/features/media/types";

import {
  type AddToLibraryFieldErrors,
  type AddToLibraryFormValues,
  DEFAULT_ADD_TO_LIBRARY_FORM_VALUES,
  hasAddToLibraryFieldErrors,
  resolveAddToLibraryMedia,
  validateAddToLibraryForm,
} from "@/features/library/services/add-to-library-form";
import { getMembershipWatchlistIds } from "@/features/library/services/get-membership-watchlist-ids";
import { buildAddToListInputs } from "@/lib/payload/types/library-mutations";
import { useAddToLists } from "@/lib/query/hooks/use-add-to-lists";
import { useWatchlistMemberships } from "@/lib/query/hooks/use-watchlist-memberships";
import { getErrorMessage } from "@/utils/get-error-message";

const EMPTY_MEMBERSHIPS: WatchlistMembership[] = [];

type UseAddToLibraryFormOptions = {
  existingLibraryItem?: LibraryItem;
  media: MediaDisplay;
  onSuccess?: () => void;
};

export function useAddToLibraryForm({
  existingLibraryItem,
  media,
  onSuccess,
}: UseAddToLibraryFormOptions) {
  const [values, setValues] = useState<AddToLibraryFormValues>(
    DEFAULT_ADD_TO_LIBRARY_FORM_VALUES,
  );
  const [fieldErrors, setFieldErrors] = useState<AddToLibraryFieldErrors>({});

  const addToListsMutation = useAddToLists();
  const { data: membershipsData } = useWatchlistMemberships(
    existingLibraryItem?.id,
    { enabled: existingLibraryItem != null },
  );
  const memberships = membershipsData ?? EMPTY_MEMBERSHIPS;

  const disabledWatchlistIds = useMemo(
    () => getMembershipWatchlistIds(memberships),
    [memberships],
  );

  const isInLibrary = existingLibraryItem != null;
  const isSubmitting = addToListsMutation.isPending;

  const resetForm = useCallback(() => {
    setValues(DEFAULT_ADD_TO_LIBRARY_FORM_VALUES);
    setFieldErrors({});
  }, []);

  const setStatus = useCallback((status: MediaStatus) => {
    setValues((current) => ({ ...current, status }));
    setFieldErrors((current) => ({ ...current, status: undefined }));
  }, []);

  const setNote = useCallback((note: string) => {
    setValues((current) => ({ ...current, note }));
    setFieldErrors((current) => ({ ...current, note: undefined }));
  }, []);

  const setWatchlistIds = useCallback(
    (watchlistIds: number[]) => {
      const nextWatchlistIds = watchlistIds.filter(
        (watchlistId) => !disabledWatchlistIds.has(watchlistId),
      );

      setValues((current) => {
        if (areWatchlistIdsEqual(current.watchlistIds, nextWatchlistIds)) {
          return current;
        }

        return { ...current, watchlistIds: nextWatchlistIds };
      });
      setFieldErrors((current) => ({ ...current, watchlists: undefined }));
    },
    [disabledWatchlistIds],
  );

  const submit = useCallback(async () => {
    const errors = validateAddToLibraryForm(values, { disabledWatchlistIds });

    if (hasAddToLibraryFieldErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    const selectableWatchlistIds = values.watchlistIds.filter(
      (watchlistId) => !disabledWatchlistIds.has(watchlistId),
    );

    try {
      await addToListsMutation.mutateAsync(
        buildAddToListInputs({
          media: resolveAddToLibraryMedia(media, existingLibraryItem),
          note: values.note.trim() || undefined,
          status: isInLibrary ? undefined : values.status,
          watchlistIds: selectableWatchlistIds,
        }),
      );

      toast.success(
        selectableWatchlistIds.length === 1
          ? "Added to watchlist"
          : `Added to ${selectableWatchlistIds.length} watchlists`,
      );
      resetForm();
      onSuccess?.();
    } catch (error) {
      toast.error(
        getErrorMessage(error instanceof Error ? error : null) ??
          "Could not add to library",
      );
    }
  }, [
    addToListsMutation,
    disabledWatchlistIds,
    existingLibraryItem,
    isInLibrary,
    media,
    onSuccess,
    resetForm,
    values,
  ]);

  return {
    disabledWatchlistIds,
    fieldErrors,
    isInLibrary,
    isSubmitting,
    resetForm,
    setNote,
    setStatus,
    setWatchlistIds,
    submit,
    values,
  };
}

function areWatchlistIdsEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((id, index) => id === b[index]);
}
