import { useState, useEffect } from 'react';
import './App.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AnimatePresence } from 'framer-motion';

// Importa i tuoi componenti
import A1_LikesTopicYear from './components/A1_LikesTopicYear';
import A2_TopicTrendMonth from './components/A2_TopicTrendMonth';
import A3_TopTweets from './components/A3_TopTweets';
import A4_AverageSentimentTopic from "./components/A4_AverageSentimentTopic";
import A5_AverageSentimentYear from './components/A5_AverageSentimentYear';


const App = () => {
  const [tweet, setTweet] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null); // Questo ora sarà la risposta completa

  // Rimuovi questo stato, non serve più per il non-streaming
  // const [currentExplanation, setCurrentExplanation] = useState(''); 

  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('Obama'); 
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    if (selectedAuthor) {
      fetch(`http://localhost:8000/analytics/topics?author=${selectedAuthor}`)
        .then(res => res.json())
        .then(res => {
          setTopics(res.topics);
          setSelectedTopic(res.topics[0] || '');
        });
    }
  }, [selectedAuthor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null); // Resetta la risposta precedente
    // Rimuovi questa riga
    // setCurrentExplanation(''); 

    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweet })
      });

      // NON più gestione dello streaming, ma attesa di un singolo JSON
      const data = await res.json(); 
      
      // Gestione di potenziali errori HTTP dal backend (e.g., status 404/500)
      if (!res.ok) {
          // Se il backend ha restituito un errore JSON, usalo. Altrimenti, un errore generico.
          console.error('Backend error:', data.explanation || 'Unknown error');
          setResponse({
              predicted_author: "ERROR",
              explanation: data.explanation || `Server error: ${res.statusText}`,
              confidence: 0.0,
              topic: data.topic || "N/A",
              topic_confidence: data.topic_confidence || 0.0
          });
      } else {
          setResponse(data); // Imposta la risposta completa
      }
      
    } catch (error) {
      console.error('Error during fetch:', error);
      setResponse({
          predicted_author: "ERROR",
          explanation: `An unexpected error occurred: ${error.message}`,
          confidence: 0.0,
          topic: "N/A",
          topic_confidence: 0.0
      });
    }

    setLoading(false);
  };

  return (
    <div className="container py-5 d-flex flex-column align-items-center">
      <div className="card p-4 shadow" style={{ maxWidth: '700px', width: '100%' }}>
        <div className="text-center mb-4">
          <i className="fas fa-user-secret fa-2x text-primary me-2"></i>
          <h1 className="h4 fw-bold d-inline">Twitter Author Identifier</h1>
          <p className="text-muted">Determine if a tweet was likely written by a specific person</p>
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

        {/* Visualizzazione della risposta completa, non in streaming */}
        {response && !loading && (
          <div className="alert alert-info mt-4">
            <h5 className="mb-3">Analysis Result</h5>
            <p>
              {response.explanation}
            </p>
            {/* Ho rimosso il paragrafo con Topic e LLM Confidence */}
          </div>
        )}
      </div>

      {/* Resto dei grafici e componenti (rimangono invariati per ora) */}
      <div className="card p-4 shadow mt-5" style={{ maxWidth: '700px', width: '100%' }} data-aos="fade-up">
        <div className="mb-3">
          <h5>Likes per Topic per Year</h5>
          <p className="mt-3 text-muted">
            This chart shows how the number of likes received on tweets related to a selected topic has evolved over the years for each author. 
            It helps identify trends in public interest and engagement on specific themes, such as politics, climate change, or health. 
            By analyzing like counts per year, users can better understand which topics gained or lost popularity over time.
          </p>

          <label className="form-label mt-2">Select Author</label>
          <select className="form-select mb-3" value={selectedAuthor} onChange={(e) => setSelectedAuthor(e.target.value)}>
            <option value="Obama">Barack Obama</option>
            <option value="Musk">Elon Musk</option>
          </select>

          <label className="form-label">Select Topic</label>
          <select className="form-select" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        <A1_LikesTopicYear topic={selectedTopic} author={selectedAuthor} />
      </div>

      <div className="card p-4 shadow mt-5" style={{ maxWidth: '700px', width: '100%' }} data-aos="fade-up">
        <A2_TopicTrendMonth />
      </div>
      
      <AnimatePresence mode="wait">
        <A3_TopTweets key="top-tweets" />
      </AnimatePresence>

      <A4_AverageSentimentTopic/>

      <A5_AverageSentimentYear />
        
    </div>
  );
};

export default App;