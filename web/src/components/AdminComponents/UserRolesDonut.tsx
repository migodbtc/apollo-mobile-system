import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ["Civilians", "Responders", "Administrators", "Superadministrators"],
  datasets: [
    {
      data: [63, 28, 12, 5],
      backgroundColor: ["#3B82F6", "#F59E0B", "#EF4444", "#01B073"],
      borderColor: ["#3B82F6", "#F59E0B", "#EF4444", "#01B073"],
      borderWidth: 1,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
};

const UserRolesDonut = () => {
  return <Doughnut data={data} options={options} />;
};

export default UserRolesDonut;
