from neo4j_connector import Neo4jConnector

db = Neo4jConnector()
# Current topics are: ["politics", "climate change", "USA", "health", "americans", "business"]
tweets = db.get_tweets_by_topic("USA", limit=6)

for tweet in tweets:
    print(f"[{tweet['date']}] {tweet['text']} (Sentiment: {tweet['sentiment']})")

db.close()
