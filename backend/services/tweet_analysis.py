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
    context_tweets = df.iloc[indices[0]]["text"].tolist()
    
    print("context_tweets", context_tweets)

    # Prompt creation
    context_str = "\n".join(f'- "{t}" (Author: {a})' for t, a in zip(df["text"].tolist(), df["author"].tolist()))
    prompt = f"""I will provide you with a list of tweets.

Tweets:
{context_str}

Now, consider this new tweet:

"{tweet}"
Question: Could this tweet have been written by Obama, Musk or neither?
Answer and give a brief explanation."""

    # Call the LLM
    try:
        completion = client.chat.completions.create(
            model="local-model", # Local model name (using meta-llama-3-8b-instruct)
            messages=[
                {"role": "system", "content": "You are an expert in tweet analysis and author attribution."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1, # Making the model more deterministic
            max_tokens=200, # Aumenta i max_tokens se l'spiegazione può essere lunga
            # Puoi aggiungere altri parametri come top_p, frequency_penalty, ecc.
        )
        
        raw_response = completion.choices[0].message.content
        print(f"[DEBUG] Llama 3 Raw Response: {raw_response}")

        # --- Parsing della risposta del modello ---
        # Il modello risponderà con "Obama" o "Musk" o "neither" e la spiegazione.
        # Dobbiamo estrarre l'autore e la spiegazione.
        # Llama 3 è abbastanza bravo a seguire istruzioni, ma potrebbe essere necessario
        # un po' di parsing robusto se la sua risposta non è sempre nello stesso formato.

        # Esempio di parsing semplice: cerca le parole chiave
        predicted_author = "neither"
        explanation = raw_response

        # Cerca "Obama" o "Musk" (case-insensitive)
        if "Obama" in raw_response:
            predicted_author = "Obama"
        elif "Musk" in raw_response:
            predicted_author = "Musk"
        
        # Potresti voler raffinare l'estrazione dell'spiegazione
        # Ad esempio, se il modello risponde "Obama. Because of X, Y, Z.", potresti
        # dividere la stringa per il primo "." o cercare pattern specifici.
        # Per ora, l'intera risposta è l'spiegazione.

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
    



    