import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// DATA
//
// Data to be used within this chart should represent weekly number of
// report submissions, showing up to 14 weeks.

const labels = [
  "04/23-04/29",
  "04/30-05/06",
  "05/07-05/13",
  "05/14-05/20",
  "05/21-05/27",
  "05/28-06/03",
  "06/04-06/10",
  "06/11-06/17",
];

const options = {
  responsive: true,
  maintainAspectRatio: false,
};

const data = {
  labels,
  datasets: [
    {
      label: "Reports Submitted",
      data: labels.map(() => Math.floor(Math.random() * 10)),
      backgroundColor: "#c2410c",
    },
  ],
};

const SubmissionDateChart = () => {
  return <Bar options={options} data={data} />;
};

export default SubmissionDateChart;
