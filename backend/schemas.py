from pydantic import BaseModel

class TweetRequest(BaseModel):
    tweet: str

class TweetResponse(BaseModel):
    author: str
    confidence: float
    message: str
