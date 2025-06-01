import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const SentimentPerYear = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchSentiment = async () => {
      const res = await fetch("http://localhost:8000/sentiment-per-year");
      const json = await res.json();
      setData(json.data);
    };
    fetchSentiment();
  }, []);

  return (
    <motion.div
      className="card p-4 shadow mt-5"
      style={{ maxWidth: "700px", width: "100%" }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5 }}
    >
      <h5 className="mb-4">Average Sentiment per Year</h5>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis domain={[-1, 1]} tickFormatter={(v) => v.toFixed(1)} />
          <Tooltip formatter={(v) => v.toFixed(3)} />
          <Line type="monotone" dataKey="avg_sentiment" stroke="#0d6efd" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default SentimentPerYear;
