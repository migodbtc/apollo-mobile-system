import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";

// Register ChartJS components once (moved outside component)
ChartJS.register(ArcElement, Tooltip, Legend);

// Constants (moved outside to prevent recreation)
const roleLabels = [
  "Civilians",
  "Responders",
  "Administrators",
  "Superadministrators",
];

const roleColors = [
  "#3B82F6", // Civilian
  "#F59E0B", // Responder
  "#EF4444", // Administrator
  "#01B073", // Superadministrator
];

const roleMap: Record<string, number> = {
  civilian: 0,
  responder: 1,
  admin: 2,
  superadmin: 3,
};

const UserRolesDonut = () => {
  const { userAccounts } = useAdminSQL();

  const roleCounts = useMemo(() => {
    const counts = [0, 0, 0, 0];
    userAccounts.forEach((user) => {
      const idx = roleMap[user.UA_user_role];
      if (typeof idx === "number") {
        counts[idx]++;
      }
    });
    return counts;
  }, [userAccounts]);

  const data = useMemo(
    () => ({
      labels: roleLabels,
      datasets: [
        {
          data: roleCounts,
          backgroundColor: roleColors,
          borderColor: roleColors,
          borderWidth: 1,
        },
      ],
    }),
    [roleCounts]
  );

  const options: ChartOptions<"doughnut"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right" as const,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || "";
              const value = Number(context.raw) || 0;
              const total = context.dataset.data.reduce(
                (a: number, b: number) => a + b,
                0
              );
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      cutout: "70%",
    }),
    []
  );

  return <Doughnut data={data} options={options} />;
};

export default React.memo(UserRolesDonut);
