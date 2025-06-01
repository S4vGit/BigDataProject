import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const LikesByYearChart = ({ topic }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/analytics/likes-by-year?topic=${encodeURIComponent(topic)}`)
      .then(res => res.json())
      .then(res => {
        const labels = res.data.map(item => item.year);
        const likes = res.data.map(item => item.likes);
        setData({
          labels,
          datasets: [
            {
              label: `Likes per Year for "${topic}"`,
              data: likes,
              borderColor: "#0d6efd",
              fill: false,
              tension: 0.3
            }
          ]
        });
      });
  }, [topic]);

  if (!data) return <p>Loading chart...</p>;

  return (
    <motion.div
      key={topic}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-5"
    >
      <Line data={data} />
    </motion.div>
  );
};

export default LikesByYearChart;
