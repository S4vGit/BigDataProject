from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from schemas import TweetRequest, TweetResponse
import pandas as pd
from neo4j_connector import Neo4jConnector


from services.topic_extraction import classify_topic
from services.tweet_analysis import analyze_tweet_with_context

app = FastAPI()
connector = Neo4jConnector()

# Allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend origin URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze")
async def analyze_tweet(data: TweetRequest):
    topic, confidence = classify_topic(data.tweet)
    print(f"[DEBUG] Topic extracted: {topic} ({confidence:.2%})")
    
    df = connector.get_tweets_by_author_topic(data.author, topic)
    df = pd.DataFrame(df)
    
    # If no tweets are found for the specified author and topic, return a message
    if df.empty:
        return {
            "result": "ERROR: No tweets found for this author and topic.",
        }
    
    result = analyze_tweet_with_context(data.tweet, data.author, df)
    result["topic"] = topic
    result["topic_confidence"] = round(confidence * 100, 2)
    return result

@app.get("/analytics/likes-by-year")
async def get_likes_by_year(topic: str = Query(..., description="Topic to analyze")):
    try:
        data = connector.get_likes_by_year_for_topic(topic)
        return {"topic": topic, "data": data}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    
@app.get("/topic-trend-by-year")
def topic_trend_by_year(year: str = Query(..., min_length=4, max_length=4)):
    data = connector.get_topic_trend_by_year(year)
    return {"data": data}

@app.get("/top-tweets")
def get_top_tweets(metric: str = Query("likes", enum=["likes", "retweets"]), limit: int = 5):
    data = connector.get_top_tweets(metric, limit)
    return {"data": data}

@app.get("/analytics/sentiment-by-topic")
def sentiment_by_topic():
    data = connector.get_average_sentiment_by_topic()
    return {"data": data}

@app.get("/sentiment-per-year")
def sentiment_per_year():
    data = connector.get_average_sentiment_per_year()
    return {"data": data}