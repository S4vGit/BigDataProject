import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const A2_TopicTrendMonth = () => {
  const [years, setYears] = useState([]);
  const [year, setYear] = useState("2019");
  const [author, setAuthor] = useState('All');
  const [data, setData] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
  const fetchTopicsAndYears = async () => {
    const [topicsRes, yearsRes] = await Promise.all([
      fetch(`http://localhost:8000/analytics/topics?author=${author}`),
      fetch(`http://localhost:8000/analytics/years?author=${author}`)
    ]);

    const topicsJson = await topicsRes.json();
    const yearsJson = await yearsRes.json();

    setTopics(topicsJson.topics);
    setYears(yearsJson.years);

    // Se l'anno corrente non è più disponibile per il nuovo autore, resetta
    if (!yearsJson.years.includes(year)) {
      setYear(yearsJson.years.at(-1) || "2019");  // default fallback
    }
  };

  fetchTopicsAndYears();
}, [author]);


  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:8000/topic-trend-by-year?year=${year}&author=${author}`);
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

      setData(formatted);
    };

    fetchData();
  }, [year, author]);

  return (
    <div>
      <h5 className="mb-3">Topic Trend per Month in {year}</h5>
      <p className="text-muted mb-3">
        This chart displays the monthly distribution of tweet topics for a selected year and author. 
        It allows users to observe how different topics vary in prominence throughout the year, 
        helping identify seasonal patterns or bursts of public interest in specific themes.
      </p>

      <div className="row mb-4">
        <div className="col">
          <label className="form-label">Select Year</label>
          <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="col">
          <label className="form-label">Select Author</label>
          <select className="form-select" value={author} onChange={(e) => setAuthor(e.target.value)}>
            <option value="All">All</option>
            <option value="Obama">Barack Obama</option>
            <option value="Musk">Elon Musk</option>
          </select>
        </div>
      </div>

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

export default A2_TopicTrendMonth;
