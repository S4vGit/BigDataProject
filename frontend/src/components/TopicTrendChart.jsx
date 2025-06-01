import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TopicTrendChart = () => {
  const [year, setYear] = useState('2019');
  const [data, setData] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:8000/topic-trend-by-year?year=${year}`);
      const json = await res.json();

      const topicSet = new Set();
      const grouped = {};
      json.data.forEach(({ month, topic, count }) => {
        topicSet.add(topic);
        if (!grouped[month]) grouped[month] = {};
        grouped[month][topic] = count;
      });

      const allTopics = Array.from(topicSet);
      const formatted = Object.entries(grouped)
        .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
        .map(([month, topicsObj]) => {
          const entry = { month };
          allTopics.forEach(topic => {
            entry[topic] = topicsObj[topic] || 0;
          });
          return entry;
        });

      setTopics(allTopics);
      setData(formatted);
    };

    fetchData();
  }, [year]);

  return (
    <div>
      <h5 className="mb-3">Topic Trend per Month in {year}</h5>
      <select className="form-select mb-4" value={year} onChange={(e) => setYear(e.target.value)}>
        {[...Array(8)].map((_, i) => {
          const y = 2012 + i;
          return <option key={y} value={y}>{y}</option>;
        })}
      </select>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis
            dataKey="month"
            tickFormatter={(month) => {
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              return monthNames[parseInt(month, 10) - 1] || month;
            }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {topics.map((topic, idx) => (
            <Line
              key={topic}
              type="monotone"
              dataKey={topic}
              stroke={`hsl(${(idx * 80) % 360}, 70%, 50%)`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicTrendChart;
