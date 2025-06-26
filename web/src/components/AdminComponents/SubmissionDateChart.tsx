import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatWeekLabel = (start: Date) => {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(start.getMonth() + 1)}/${pad(start.getDate())}-${pad(
    end.getMonth() + 1
  )}/${pad(end.getDate())}`;
};

const SubmissionDateChart = () => {
  const { combinedReports } = useAdminSQL();

  const { labels, weekCounts } = useMemo(() => {
    const today = new Date();
    const weeks: { start: Date; label: string }[] = [];
    let currentWeekStart = getWeekStart(today);

    for (let i = 13; i >= 0; i--) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - i * 7);
      weeks.push({
        start: new Date(weekStart),
        label: formatWeekLabel(weekStart),
      });
    }

    const counts = weeks.map(({ start }) => {
      const weekEnd = new Date(start);
      weekEnd.setDate(start.getDate() + 7);
      return combinedReports.filter(([pre]) => {
        const reportDate = new Date(pre.PR_timestamp);
        return reportDate >= start && reportDate < weekEnd;
      }).length;
    });

    return {
      labels: weeks.map((w) => w.label),
      weekCounts: counts,
    };
  }, [combinedReports]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
    }),
    []
  );

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Reports Submitted",
          data: weekCounts,
          backgroundColor: "#c2410c",
        },
      ],
    }),
    [labels, weekCounts]
  );

  return <Bar options={options} data={data} />;
};

export default React.memo(SubmissionDateChart);
