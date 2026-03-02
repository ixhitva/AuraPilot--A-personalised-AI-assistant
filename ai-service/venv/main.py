from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv
import os, uuid, time

load_dotenv()
app = FastAPI(title="AuraPilot AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Clients ---
llm = ChatGroq(groq_api_key=os.getenv("GROQ_API_KEY"), model_name="llama3-8b-8192", temperature=0.7)
qdrant = QdrantClient(url=os.getenv("QDRANT_URL", "http://localhost:6333"))
embedder = SentenceTransformer("all-MiniLM-L6-v2")
sentiment_analyzer = SentimentIntensityAnalyzer()

COLLECTION = "aurapilot_memory"

# Create Qdrant collection if not exists
try:
    qdrant.get_collection(COLLECTION)
except:
    qdrant.create_collection(
        collection_name=COLLECTION,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE)
    )

# --- Models ---
class ChatRequest(BaseModel):
    user_id: str
    message: str
    persona: str = "Friendly"
    user_name: str = "User"
    history: list = []

class MemoryRequest(BaseModel):
    user_id: str
    query: str

# --- Helpers ---
def store_memory(user_id: str, text: str, role: str):
    vector = embedder.encode(text).tolist()
    qdrant.upsert(
        collection_name=COLLECTION,
        points=[PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={"user_id": user_id, "text": text, "role": role, "timestamp": time.time()}
        )]
    )

def retrieve_memory(user_id: str, query: str, top_k: int = 5):
    query_vector = embedder.encode(query).tolist()
    results = qdrant.search(
        collection_name=COLLECTION,
        query_vector=query_vector,
        limit=top_k,
        query_filter={"must": [{"key": "user_id", "match": {"value": user_id}}]}
    )
    return [r.payload["text"] for r in results]

# --- Routes ---
@app.post("/chat")
async def chat(req: ChatRequest):
    # Sentiment detection
    score = sentiment_analyzer.polarity_scores(req.message)["compound"]
    tone = "warmly and enthusiastically" if score >= 0.05 else "with empathy and calm" if score <= -0.05 else "clearly and helpfully"

    # Retrieve relevant long-term memory from Qdrant
    memories = retrieve_memory(req.user_id, req.message)
    memory_context = "\n".join(memories) if memories else "No prior context."

    system_prompt = f"""You are AuraPilot, a {req.persona.lower()} AI assistant.
The user's name is {req.user_name}. Use their name occasionally.
Respond {tone}.

Relevant memory from past conversations:
{memory_context}

Be concise, helpful, and personalized."""

    # Build message chain
    messages = [SystemMessage(content=system_prompt)]
    for msg in req.history[-6:]:  # last 3 exchanges
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        else:
            messages.append(AIMessage(content=msg["content"]))
    messages.append(HumanMessage(content=req.message))

    response = llm.invoke(messages)
    reply = response.content

    # Store this exchange in Qdrant memory
    store_memory(req.user_id, f"User said: {req.message}", "user")
    store_memory(req.user_id, f"Assistant replied: {reply}", "assistant")

    return {
        "reply": reply,
        "sentiment": "positive" if score >= 0.05 else "negative" if score <= -0.05 else "neutral",
        "memories_used": len(memories)
    }

@app.get("/memory/{user_id}")
async def get_memories(user_id: str):
    results = qdrant.scroll(
        collection_name=COLLECTION,
        scroll_filter={"must": [{"key": "user_id", "match": {"value": user_id}}]},
        limit=20
    )
    return {"memories": [r.payload for r in results[0]]}

@app.delete("/memory/{user_id}")
async def clear_memory(user_id: str):
    qdrant.delete(
        collection_name=COLLECTION,
        points_selector={"filter": {"must": [{"key": "user_id", "match": {"value": user_id}}]}}
    )
    return {"message": "Memory cleared"}

@app.get("/health")
async def health():
    return {"status": "ok"}
