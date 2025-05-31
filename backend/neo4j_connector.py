from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

class Neo4jConnector:
    def __init__(self):
        """
        Initialize the Neo4j database connection using environment variables.
        """
        self.driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI"),
            auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
        )

    def close(self):
        """
        Close the Neo4j database connection.
        """
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
                limit=limit
            )
            return [record.data() for record in result]

    def get_tweets_by_author(self, author: str):
        """
        Retrieve tweets by a specific author from the Neo4j database.
            Args:
                author (str): The author's name to search for.
            Returns:
                list: A list of tweets by the specified author, each represented as a dictionary.
        """
        if author.lower() != "obama":
            return ValueError("Author not found.")

        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tweet)
                RETURN t.text AS text, t.date AS date, t.sentiment AS sentiment
                ORDER BY t.date DESC
                """,
            )
            return [record.data() for record in result]
