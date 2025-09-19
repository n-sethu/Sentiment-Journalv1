from fastapi import FastAPI, Depends, HTTPException, Header
from supabase import create_client, Client
from textblob import TextBlob
from dotenv import load_dotenv
import os
import requests

app = FastAPI()



load_dotenv()  # this reads .env into os.environ

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("SUPABASE_URL:", SUPABASE_URL)
print("SUPABASE_KEY:", "FOUND" if SUPABASE_KEY else "MISSING")
def get_current_user(authorization: str = Header(...)):
    token = authorization.split(" ")[1]
    res = requests.get(
        f"{SUPABASE_URL}/auth/v1/user",
        headers={"Authorization": f"Bearer {token}", "apikey": SUPABASE_KEY}
    )
    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid token")
    return res.json()

@app.post("/journal")
def create_journal(data: dict, user=Depends(get_current_user)):
    content = data["content"]
    blob = TextBlob(content)
    sentiment = blob.sentiment.polarity
    mood = "positive" if sentiment > 0.1 else "negative" if sentiment < -0.1 else "neutral"

    supabase.table("journals").insert({
        "user_id": user["id"],
        "content": content,
        "sentiment": sentiment,
        "mood_category": mood
    }).execute()
    return {"status": "ok"}

@app.get("/journals")
def get_journals(user=Depends(get_current_user)):
    res = supabase.table("journals").select("*").eq("user_id", user["id"]).execute()
    return res.data
