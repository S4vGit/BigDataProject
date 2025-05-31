from pydantic import BaseModel

class TweetRequest(BaseModel):
    tweet: str
    author: str  # optional: the profile to compare to

class TweetResponse(BaseModel):
    author: str
    confidence: float
    message: str
