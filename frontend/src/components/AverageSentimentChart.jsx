import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AverageSentimentChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/analytics/sentiment-by-topic")
      .then(res => res.json())
      .then(res => {
        const labels = res.data.map(d => d.topic);
        const values = res.data.map(d => d.average_sentiment);

        setChartData({
          labels,
          datasets: [
            {
              label: "Average Sentiment Score",
              data: values,
              backgroundColor: values.map(v => 
                v > 0 ? 'rgba(40, 167, 69, 0.7)' : v < 0 ? 'rgba(220, 53, 69, 0.7)' : 'rgba(255, 193, 7, 0.7)'
              ),
              borderColor: "#333",
              borderWidth: 1,
            },
          ],
        });
      });
  }, []);

  if (!chartData) return <p>Loading sentiment chart...</p>;

  return (
    <div className="card p-4 shadow mt-5" style={{ maxWidth: '700px', width: '100%' }}>
      <h5 className="mb-3">Average Sentiment by Topic</h5>
      <Bar
        data={chartData}
        options={{
          scales: {
            y: {
              beginAtZero: true,
              min: -1,
              max: 1,
              ticks: {
                stepSize: 0.5
              }
            }
          }
        }}
      />
    </div>
  );
};

export default AverageSentimentChart;
