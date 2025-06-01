import { useState, useEffect } from 'react';
import './App.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AnimatePresence } from 'framer-motion';

import LikesByYearChart from './components/LikesByYearChart'; 
import TopicTrendChart from './components/TopicTrendChart';
import TopTweets from './components/TopTweets';
import AverageSentimentChart from "./components/AverageSentimentChart";
import SentimentPerYear from './components/SentimentPerYear';



const App = () => {
  const [tweet, setTweet] = useState('');
  const [profile, setProfile] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const [selectedTopic, setSelectedTopic] = useState('USA');

  useEffect(() => {
  AOS.init({ duration: 1000 });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweet, author: profile })
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
    }

    setLoading(false);
  };

  const topics = ["politics", "climate change", "USA", "health", "family", "business", "finance"];

  return (
    <div className="container py-5 d-flex flex-column align-items-center">
      <div className="card p-4 shadow" style={{ maxWidth: '700px', width: '100%' }}>
        <div className="text-center mb-4">
          <i className="fas fa-user-secret fa-2x text-primary me-2"></i>
          <h1 className="h4 fw-bold d-inline">Twitter Author Identifier</h1>
          <p className="text-muted">Determine if a tweet was likely written by a specific person</p>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <label className="form-label">Select Profile to Compare</label>
          <select className="form-select" value={profile} onChange={(e) => setProfile(e.target.value)}>
            <option value="">-- Select a profile --</option>
            <option value="elonmusk">Elon Musk</option>
            <option value="obama">Barack Obama</option>
            <option value="realDonaldTrump">Donald Trump</option>
            <option value="BillGates">Bill Gates</option>
            <option value="cristiano">Cristiano Ronaldo</option>
          </select>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Enter tweet to analyze</label>
            <textarea
              className="form-control"
              rows="4"
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
              required
              placeholder="Paste the tweet you want to analyze here..."
            />
          </div>
          <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center" type="submit" disabled={loading}>
            <i className="fas fa-search me-2"></i>
            {loading ? 'Analyzing...' : 'Analyze Tweet'}
          </button>
        </form>

        {loading && (
          <div className="text-center mt-4">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2">Analyzing writing patterns...</p>
          </div>
        )}

        {response && !loading && (
          <div className="alert alert-info mt-4">
            <h5>Result</h5>
            <p><strong>Answer:</strong> {response.result}</p>
          </div>
        )}
      </div>

      {/* GRAFICO LIKES PER TOPIC */}
      <div className="card p-4 shadow mt-5" style={{ maxWidth: '700px', width: '100%' }} data-aos="fade-up">
        <div className="mb-3">
          <h5>Like Topic per Year</h5>
          <p className="mt-3 text-muted">
            This chart shows how the number of likes received on tweets related to a selected topic has evolved over the years. 
            It helps identify trends in public interest and engagement on specific themes, such as politics, climate change, or health. 
            By analyzing like counts per year, users can better understand which topics gained or lost popularity over time.
          </p>
          <select className="form-select" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>
        
        <LikesByYearChart topic={selectedTopic} />
      </div>

      {/* GRAFICO TREND TOPIC PER ANNO  */}
      <div className="card p-4 shadow mt-5" style={{ maxWidth: '700px', width: '100%' }} data-aos="fade-up">
        <TopicTrendChart />
      </div>
      

      <AnimatePresence mode="wait">
        <TopTweets key="top-tweets" />
      </AnimatePresence>

      <AverageSentimentChart/>

      <SentimentPerYear />
        
    </div>
  );
};

export default App;
