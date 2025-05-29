from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

class Neo4jConnector:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI"),
            auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
        )

    def close(self):
        self.driver.close()

    def get_tweets_by_topic(self, topic: str, limit: int = 5):
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tweet)
                WHERE t.topic = $topic
                RETURN t.text AS text, t.date AS date, t.sentiment AS sentiment
                LIMIT $limit
                """,
                topic=topic,
                limit = limit
            )
            return [record.data() for record in result]
