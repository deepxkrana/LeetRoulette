import { useMemo } from "react";
import type { SolvedProblem } from "../types";

interface HeatmapProps {
  problems: SolvedProblem[];
}

const WEEKS_TO_SHOW = 26; // ~6 months
const DAYS_IN_WEEK = 7;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getColor(count: number): string {
  if (count === 0) return "var(--heatmap-0)";
  if (count === 1) return "var(--heatmap-1)";
  if (count === 2) return "var(--heatmap-2)";
  if (count <= 4) return "var(--heatmap-3)";
  return "var(--heatmap-4)";
}

export default function Heatmap({ problems }: HeatmapProps) {
  const { grid, monthLabels } = useMemo(() => {
    // Build a map of date -> count
    const dateCountMap = new Map<string, number>();
    for (const p of problems) {
      if (!p.date_solved) continue;
      const dateKey = p.date_solved.slice(0, 10); // "YYYY-MM-DD"
      dateCountMap.set(dateKey, (dateCountMap.get(dateKey) ?? 0) + 1);
    }

    // Build grid: array of weeks, each week is an array of 7 days
    const today = new Date();
    const todayDay = today.getDay(); // 0 = Sunday
    const totalDays = WEEKS_TO_SHOW * DAYS_IN_WEEK;

    // Start from the first day of the grid
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + (DAYS_IN_WEEK - todayDay));

    const weeks: { date: Date; count: number }[][] = [];
    const labels: { text: string; colIndex: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < WEEKS_TO_SHOW; w++) {
      const week: { date: Date; count: number }[] = [];
      for (let d = 0; d < DAYS_IN_WEEK; d++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + w * 7 + d);

        const key = cellDate.toISOString().slice(0, 10);
        const count = dateCountMap.get(key) ?? 0;
        week.push({ date: cellDate, count });

        // Track month labels (first occurrence of a new month on Sunday/first day)
        if (d === 0 && cellDate.getMonth() !== lastMonth) {
          lastMonth = cellDate.getMonth();
          labels.push({ text: MONTH_NAMES[cellDate.getMonth()], colIndex: w });
        }
      }
      weeks.push(week);
    }

    return { grid: weeks, monthLabels: labels };
  }, [problems]);

  return (
    <div className="heatmap-section">
      <div className="heatmap-header">
        <div className="heatmap-title">Solving Activity</div>
        <div className="heatmap-legend">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="legend-cell"
              style={{ background: getColor(level === 0 ? 0 : level) }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="heatmap-grid-wrapper">
        {/* Month labels */}
        <div className="heatmap-months">
          {monthLabels.map((label, i) => (
            <div
              key={i}
              className="heatmap-month-label"
              style={{
                position: "relative",
                left: `${label.colIndex * 15}px`,
                width: 0,
                whiteSpace: "nowrap",
              }}
            >
              {label.text}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="heatmap-grid">
          {grid.map((week, wi) => (
            <div key={wi} className="heatmap-column">
              {week.map((cell, di) => (
                <div
                  key={di}
                  className="heatmap-cell"
                  style={{ background: getColor(cell.count) }}
                  title={`${cell.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}: ${cell.count} problem${cell.count !== 1 ? "s" : ""}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
