import type { ChallengeStatsStatus } from "../constants/watchlist-challenge";
import type { WatchlistChallengeConfig, WatchlistStatsCache } from "./types";

import { parseReleaseDate } from "../utils/dates";

export function computeChallengePacing(input: {
  challenge: WatchlistChallengeConfig;
  completed: number;
  inProgress: number;
  referenceDate?: Date;
  remaining: number;
  watchlistCreatedAt?: string;
}): Pick<
  WatchlistStatsCache,
  | "actualPerDay"
  | "daysElapsed"
  | "daysRemaining"
  | "daysTotal"
  | "onTrack"
  | "projectedFinishDate"
  | "requiredPerDay"
  | "status"
> {
  const referenceDate = input.referenceDate ?? new Date();
  const startDate =
    parseReleaseDate(input.challenge.startDate) ??
    parseReleaseDate(input.watchlistCreatedAt) ??
    referenceDate;
  const dueDate = parseReleaseDate(input.challenge.dueDate);

  if (!dueDate) {
    return {};
  }

  const daysTotal = diffCalendarDays(startDate, dueDate);
  const daysElapsed = Math.min(
    daysTotal,
    diffCalendarDays(startDate, referenceDate),
  );
  const daysRemaining = diffCalendarDays(referenceDate, dueDate);

  const requiredPerDay =
    daysRemaining > 0 ? input.remaining / daysRemaining : undefined;
  const actualPerDay =
    daysElapsed > 0 ? input.completed / daysElapsed : undefined;

  const onTrack =
    input.remaining === 0
      ? true
      : requiredPerDay != null && actualPerDay != null
        ? actualPerDay >= requiredPerDay
        : undefined;

  const projectedFinishDate =
    input.remaining > 0 && actualPerDay != null && actualPerDay > 0
      ? addCalendarDays(referenceDate, input.remaining / actualPerDay)
      : input.remaining === 0
        ? referenceDate.toISOString().slice(0, 10)
        : undefined;

  let status: ChallengeStatsStatus;

  if (input.remaining === 0) {
    status = "completed";
  } else if (input.completed === 0 && input.inProgress === 0) {
    status = "not_started";
  } else if (daysRemaining === 0 && input.remaining > 0) {
    status = "overdue";
  } else {
    status = "active";
  }

  return {
    actualPerDay,
    daysElapsed,
    daysRemaining,
    daysTotal,
    onTrack,
    projectedFinishDate,
    requiredPerDay,
    status,
  };
}

function addCalendarDays(date: Date, days: number): string {
  const next = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  next.setUTCDate(next.getUTCDate() + Math.ceil(days));

  return next.toISOString().slice(0, 10);
}

function diffCalendarDays(start: Date, end: Date): number {
  const startUtc = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
  );
  const endUtc = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate(),
  );

  return Math.max(0, Math.round((endUtc - startUtc) / (1000 * 60 * 60 * 24)));
}
