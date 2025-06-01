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
        
    def get_topic_trend_by_year(self, year: str):
        """
        Retrieve the topic trend for a specific year from the Neo4j database.
        
        Args:
            year (str): The year to filter tweets by, in the format 'YYYY'.
            
        Returns:
            list: A list of dictionaries containing the month, topic, and count of tweets for that topic.
        """
        
        query = """
        MATCH (t:Tweet)
        WHERE t.date STARTS WITH $year AND t.topic IS NOT NULL
        RETURN substring(t.date, 5, 2) AS month, t.topic AS topic, count(*) AS count
        ORDER BY month, count DESC
        """
        with self.driver.session() as session:
            result = session.run(query, year=year)
            records = result.data()
            return records

    def get_tweets_by_author_topic(self, author: str, topic: str):
        """
        Retrieve tweets by a specific author and topic from the Neo4j database.
        
        Args:
            author (str): The author's name to search for.
            topic (str): The topic to filter tweets by.
            
        Returns:
            list: A list of tweets by the specified author and topic, each represented as a dictionary.
        """
        if author.lower() != "obama":
            print("[DEBUG] Author not found.")
            return []
        
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tweet)
                WHERE t.topic = $topic
                RETURN t.text AS text, t.date AS date, t.sentiment AS sentiment
                """,
                topic=topic,
            )
            return [record.data() for record in result]

        
    def get_likes_by_year_for_topic(self, topic: str):
        
        """
        Return number of likes per year for a given topic. 
        
        Args:
            topic (str): The topic to filter tweets by.
        
        Returns:
            list: A list of dictionaries with year and total likes for that year.
        """
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tweet)
                WHERE t.topic = $topic
                WITH t, split(t.date, "/")[0] AS year
                RETURN year, sum(t.likes) AS total_likes
                ORDER BY year
                """,
                topic=topic
            )
            return [{"year": record["year"], "likes": record["total_likes"]} for record in result]

