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

@app.get("/analytics/topics")
async def A_get_topics(author: str = Query(...)):
    try:
        topics = connector.A_get_topics_by_author(author)
        return {"author": author, "topics": topics}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/analytics/years")
async def A_get_years(author: str = Query("All")):
    try:
        years = connector.A_get_years_by_author(author)
        return {"author": author, "years": years}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/analytics/likes-by-year")
async def A1_get_likes_by_year(topic: str = Query(..., description="Topic to analyze"), author: str = Query(..., description="Author to filter by")):
    try:
        data = connector.A1_get_likes_by_year_for_topic_and_author(topic,author)
        return {"topic": topic, "author": author, "data": data}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    
@app.get("/topic-trend-by-year")
def A2_topic_trend_by_year(year: str = Query(..., min_length=4, max_length=4), author: str = Query("All")):
    data = connector.A2_get_topic_trend_by_month_year(year, author)
    return {"data": data}

@app.get("/top-tweets")
def A3_get_top_tweets(metric: str = Query("likes", enum=["likes", "retweets"]), limit: int = 5, author: str = Query(...)):
    data = connector.A3_get_top_tweets(metric, limit, author)
    return {"data": data}

@app.get("/analytics/sentiment-by-topic")
def A4_sentiment_by_topic():
    data = connector.A4_get_average_sentiment_by_topic()
    return {"data": data}

@app.get("/sentiment-per-year")
def A5_sentiment_per_year():
    data = connector.A5_get_average_sentiment_per_year()
    return {"data": data}