import { describe, expect, it } from "vitest";
import {
  reserveReportCall,
  resetReportUsageForTests,
} from "@/lib/report/usageLimit";

const morning = Date.parse("2026-11-23T10:00:00+02:00");
const nextMorning = Date.parse("2026-11-24T10:00:00+02:00");

function reserveOk(now: number) {
  const reservation = reserveReportCall(now);
  expect(reservation.ok).toBe(true);
  if (!reservation.ok) {
    throw new Error("expected a reserved report call");
  }
  return reservation;
}

describe("report usage limits", () => {
  it("allows five calls in a minute and rejects the sixth", () => {
    resetReportUsageForTests();
    for (let index = 0; index < 5; index += 1) {
      reserveOk(morning + index).finish(true);
    }
    const blocked = reserveReportCall(morning + 5_000);
    expect(blocked).toMatchObject({ ok: false, reason: "rate_limit" });
    if (!blocked.ok) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    }
    expect(reserveReportCall(morning + 60_000).ok).toBe(true);
  });

  it("keeps a failed call inside the minute limit", () => {
    resetReportUsageForTests();
    reserveOk(morning).finish(false);
    for (let index = 1; index < 5; index += 1) {
      reserveOk(morning + index).finish(true);
    }
    expect(reserveReportCall(morning + 5)).toMatchObject({
      ok: false,
      reason: "rate_limit",
    });
  });

  it("caps the day at 25 successful reports and resumes the next Tallinn day", () => {
    resetReportUsageForTests();
    for (let index = 0; index < 25; index += 1) {
      reserveOk(morning + index * 60_000).finish(true);
    }
    expect(reserveReportCall(morning + 25 * 60_000)).toMatchObject({
      ok: false,
      reason: "daily_limit",
    });
    expect(reserveReportCall(nextMorning).ok).toBe(true);
  });

  it("returns a daily slot when report generation fails", () => {
    resetReportUsageForTests();
    const slots = [];
    for (let index = 0; index < 25; index += 1) {
      slots.push(reserveOk(morning + index * 60_000));
    }
    expect(reserveReportCall(morning + 25 * 60_000).ok).toBe(false);
    slots[0]?.finish(false);
    expect(reserveReportCall(morning + 26 * 60_000).ok).toBe(true);
  });
});
