/** In-memory limits for this server process. A restart clears them. */

const CALLS_PER_MINUTE = 5;
const REPORTS_PER_DAY = 25;
const MINUTE_MS = 60_000;
const TIME_ZONE = "Europe/Tallinn";

export type UsageReservation =
  | { ok: true; finish: (success: boolean) => void }
  | { ok: false; reason: "rate_limit" | "daily_limit"; retryAfterSeconds: number };

const callTimes: number[] = [];
let dayKey = "";
let reportsToday = 0;

export function resetReportUsageForTests(): void {
  callTimes.length = 0;
  dayKey = "";
  reportsToday = 0;
}

function tallinnDate(now: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(now));
}

function syncDay(now: number): void {
  const current = tallinnDate(now);
  if (current === dayKey) {
    return;
  }
  dayKey = current;
  reportsToday = 0;
}

function secondsUntilNextTallinnDay(now: number): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(now));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  const elapsed = read("hour") * 3600 + read("minute") * 60 + read("second");
  return Math.max(1, 86_400 - elapsed);
}

function pruneCalls(now: number): void {
  const windowStart = now - MINUTE_MS;
  while (callTimes.length > 0 && callTimes[0] <= windowStart) {
    callTimes.shift();
  }
}

export function reserveReportCall(now = Date.now()): UsageReservation {
  syncDay(now);
  pruneCalls(now);

  if (reportsToday >= REPORTS_PER_DAY) {
    return {
      ok: false,
      reason: "daily_limit",
      retryAfterSeconds: secondsUntilNextTallinnDay(now),
    };
  }
  if (callTimes.length >= CALLS_PER_MINUTE) {
    const oldest = callTimes[0] ?? now;
    return {
      ok: false,
      reason: "rate_limit",
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + MINUTE_MS - now) / 1000)),
    };
  }

  callTimes.push(now);
  reportsToday += 1;
  const reservedDay = dayKey;
  let settled = false;
  return {
    ok: true,
    finish(success: boolean) {
      if (settled) {
        return;
      }
      settled = true;
      if (!success && dayKey === reservedDay) {
        reportsToday = Math.max(0, reportsToday - 1);
      }
    },
  };
}
