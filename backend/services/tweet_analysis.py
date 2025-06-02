from sentence_transformers import SentenceTransformer
import faiss
import pandas as pd
import openai

# Zero-shot classification and encoder initialization
encoder = SentenceTransformer("all-MiniLM-L6-v2")
# LM Studio client initialization
client = openai.OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

def analyze_tweet_with_context(tweet: str, df: pd.DataFrame) -> dict:
    """
    Analyze a tweet by comparing it with the author's previous tweets.
        
    Args:
        tweet (str): The tweet to analyze.
        df (pd.DataFrame): DataFrame containing the author's tweets.
        
    Returns:
        dict: A dictionary containing the result of the analysis and confidence score.
    """
    if df.empty:
        return {"error": "No tweets found for this author"}

    # Embedding and FAISS
    corpus_embeddings = encoder.encode(df["text"].tolist(), convert_to_numpy=True)
    dimension = corpus_embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(corpus_embeddings)

    # Find similar tweets
    query_embedding = encoder.encode([tweet])
    distances, indices = index.search(query_embedding, 5)
    
    context_tweets_with_authors = []
    for idx in indices[0]:
        tweet_text = df.iloc[idx]["text"]
        tweet_original_author = df.iloc[idx]["author"] # Retrieving the original author of the tweet
        context_tweets_with_authors.append(f'- "{tweet_text}" (Author: {tweet_original_author})')
    
    # Prompt creation
    context_str = "\n".join(context_tweets_with_authors)
    print("context_str", context_str)
    prompt = f"""I will provide you with a list of tweets.

Tweets:
{context_str}

Now, consider this new tweet:

"{tweet}"
Question: Could this tweet have been written by Obama, Musk or neither?
Answer and give a brief explanation.
"""

    # Call the LLM
    try:
        completion = client.chat.completions.create(
            model="local-model", # Local model name (using meta-llama-3.1-8b-instruct)
            messages=[
                {"role": "system", "content": "You are an expert in tweet analysis and author attribution. Provide concise and accurate explanations based on the context."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1, # Making the model more deterministic
            max_tokens=200, 
            stream = False,
            # Puoi aggiungere altri parametri come top_p, frequency_penalty, ecc.
        )
        
        raw_response = completion.choices[0].message.content

        # Parse the response to determine the predicted author and explanation
        predicted_author = "neither"
        explanation = raw_response

        # Check if the response contains the names of the authors
        if "Obama" in raw_response:
            predicted_author = "Obama"
        elif "Musk" in raw_response:
            predicted_author = "Musk"

        # LM Studio non ti darà una "confidence score" diretta come un classificatore BART.
        # Potresti assegnare una confidence fissa alta se il modello risponde in modo chiaro,
        # oppure implementare una logica di parsing più complessa per inferire la confidence.
        # Per questo task, una confidence fissa può essere accettabile dato che chiediamo una spiegazione.
        confidence = 1.0 # O un valore che ritieni appropriato per un modello LLM.

        return {
            "result": predicted_author,
            "explanation": explanation, # Nuova chiave per l'spiegazione
            "confidence": round(confidence * 100, 2)
        }

    except openai.APIConnectionError as e:
        print(f"ERROR: Could not connect to LM Studio API. Is LM Studio running and the server started? {e}")
        return {
            "result": "ERROR: LLM API connection failed.",
            "explanation": "Ensure LM Studio is running and its local server is active.",
            "confidence": 0.0
        }
    except Exception as e:
        print(f"An unexpected error occurred during LLM inference: {e}")
        return {
            "result": "ERROR: LLM inference failed.",
            "explanation": f"An error occurred: {e}",
            "confidence": 0.0
        }
    



    