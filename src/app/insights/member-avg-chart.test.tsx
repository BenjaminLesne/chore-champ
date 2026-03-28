import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { MemberAvgChart } from "./member-avg-chart.tsx";
import type { MemberDailyStat } from "./queries.ts";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <NuqsTestingAdapter>{children}</NuqsTestingAdapter>;
}

const sampleData: MemberDailyStat[] = [
  {
    memberId: 1,
    memberName: "Alice",
    totalLogs: 30,
    calendarDays: 30,
    avg: 1.0,
    stddev: 0.5,
  },
  {
    memberId: 2,
    memberName: "Bob",
    totalLogs: 60,
    calendarDays: 30,
    avg: 2.0,
    stddev: 1.2,
  },
];

describe("MemberAvgChart", () => {
  it("renders empty state when no data", async () => {
    const screen = await render(<MemberAvgChart data={[]} />, {
      wrapper: Wrapper,
    });
    await expect
      .element(screen.getByText("No chore data for the selected period."))
      .toBeVisible();
  });

  it("renders empty state when all members have zero logs", async () => {
    const zeroData: MemberDailyStat[] = [
      {
        memberId: 1,
        memberName: "Alice",
        totalLogs: 0,
        calendarDays: 30,
        avg: 0,
        stddev: 0,
      },
    ];
    const screen = await render(<MemberAvgChart data={zeroData} />, {
      wrapper: Wrapper,
    });
    await expect
      .element(screen.getByText("No chore data for the selected period."))
      .toBeVisible();
  });

  it("renders chart when data is provided", async () => {
    const screen = await render(<MemberAvgChart data={sampleData} />, {
      wrapper: Wrapper,
    });
    // Recharts renders member names as XAxis tick labels
    await expect.element(screen.getByText("Alice")).toBeVisible();
    await expect.element(screen.getByText("Bob")).toBeVisible();
  });
});
