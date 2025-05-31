from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from schemas import TweetRequest, TweetResponse
import pandas as pd
from neo4j_connector import Neo4jConnector

from transformers import pipeline
#from llama_cpp import Llama  # Assicurati che sia installato

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
    df_author = connector.get_tweets_by_author(data.author)
    result = analyze_tweet_with_context(data.tweet, data.author, pd.DataFrame(df_author))
    return result
