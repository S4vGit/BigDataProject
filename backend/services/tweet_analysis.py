from sentence_transformers import SentenceTransformer
import faiss
from transformers import pipeline
import pandas as pd

# Zero-shot classification and encoder initialization
encoder = SentenceTransformer("all-MiniLM-L6-v2")
#llm = Llama(model_path="models/phi-2.q4.gguf", n_ctx=2048)
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

def analyze_tweet_with_context(tweet: str, author: str, df_author: pd.DataFrame) -> dict:
    """
    Analyze a tweet by comparing it with the author's previous tweets.
        
    Args:
        tweet (str): The tweet to analyze.
        author (str): The author's name.
        df_author (pd.DataFrame): DataFrame containing the author's tweets.
        
    Returns:
        dict: A dictionary containing the result of the analysis and confidence score.
    """
    if df_author.empty:
        return {"error": "No tweets found for this author"}

    # Embedding and FAISS
    corpus_embeddings = encoder.encode(df_author["text"].tolist(), convert_to_numpy=True)
    dimension = corpus_embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(corpus_embeddings)

    # Find similar tweets
    query_embedding = encoder.encode([tweet])
    distances, indices = index.search(query_embedding, 5)
    context_tweets = df_author.iloc[indices[0]]["text"].tolist()
    
    """retriever = AuthorRetriever(encoder, df_author)
    context_tweets = retriever.retrieve_similar_tweets(tweet, top_k=5)"""
    
    print("context_tweets", context_tweets)

    # Create the prompt
    context_str = "\n".join(f'- "{t}"' for t in context_tweets)
    hypothesis = f'The following tweet was likely written by the same person:\n"{tweet}"'
    
##########----------To use with llama model----------##########
#    context_str = "\n".join(f'- "{t}"' for t in context_tweets)
#    prompt = f"""I will provide you with a list of tweets written by the same person.

#Author's tweets:
#{context_str}

#Now, consider this new tweet:

#"{data.tweet}"
#Question: Could this tweet have been written by the same person?
#Answer only with YES or NO."""

#    """# 5. Chiamata al modello
#    response = llm(prompt, max_tokens=100, echo=False)
#    answer = response["choices"][0]["text"].strip()"""
##########----------To use with llama model----------##########

    # Zero-shot classification
    result = classifier(hypothesis, candidate_labels=["yes", "no"])

    return {
        "result": result["labels"][0],
        "confidence": round(result["scores"][0] * 100, 2)
    }

