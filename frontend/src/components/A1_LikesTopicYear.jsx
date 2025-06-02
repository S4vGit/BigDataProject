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

const A1_LikesTopicYear = ({ topic, author }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!topic || !author) return;

    fetch(`http://localhost:8000/analytics/likes-by-year?topic=${encodeURIComponent(topic)}&author=${encodeURIComponent(author)}`)
      .then(res => res.json())
      .then(res => {
        const labels = res.data.map(item => item.year);
        const likes = res.data.map(item => item.likes);
        setData({
          labels,
          datasets: [
            {
              label: `Likes per Year for "${topic}" by ${author}`,
              data: likes,
              borderColor: "#0d6efd",
              fill: false,
              tension: 0.3
            }
          ]
        });
      });
  }, [topic, author]);

  if (!data) return <p>Loading chart...</p>;

  return (
    <motion.div
      key={topic + author}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-5"
    >
      <Line data={data} />
    </motion.div>
  );
};

export default A1_LikesTopicYear;
