from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import requests
from typing import List, Optional
from datetime import datetime

from models import (
    JournalEntryCreate, JournalEntryResponse, JournalEntryUpdate,
    SentimentAnalysisResponse, ModelTrainingResponse, SentimentInsightsResponse,
    UserStatsResponse
)
from services.sentiment import sentiment_analyzer

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Sentiment Journal API",
    description="AI-powered sentiment analysis for mental health journaling",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load existing model if available
sentiment_analyzer.load_model()

def get_current_user(authorization: str = Header(...)):
    """Get current user from Supabase JWT token"""
    try:
        token = authorization.split(" ")[1]
        res = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"Authorization": f"Bearer {token}", "apikey": SUPABASE_KEY}
        )
        if res.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid token")
        return res.json()
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

@app.get("/")
async def root():
    return {"message": "Sentiment Journal API is running"}

@app.post("/journal", response_model=JournalEntryResponse)
async def create_journal(entry: JournalEntryCreate, user=Depends(get_current_user)):
    """Create a new journal entry with sentiment analysis"""
    try:
        # Analyze sentiment
        sentiment_result = sentiment_analyzer.predict_sentiment(entry.content)
        
        # Create journal entry
        journal_data = {
            "user_id": user["id"],
            "content": entry.content,
            "title": entry.title,
            "sentiment": sentiment_result["sentiment"],
            "mood_category": sentiment_result["label"]
        }
        
        result = supabase.table("journals").insert(journal_data).execute()
        
        if result.data:
            return JournalEntryResponse(**result.data[0])
        else:
            raise HTTPException(status_code=500, detail="Failed to create journal entry")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/journals", response_model=List[JournalEntryResponse])
async def get_journals(
    limit: Optional[int] = 50,
    offset: Optional[int] = 0,
    user=Depends(get_current_user)
):
    """Get user's journal entries"""
    try:
        result = supabase.table("journals")\
            .select("*")\
            .eq("user_id", user["id"])\
            .order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        
        return [JournalEntryResponse(**entry) for entry in result.data]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/journal/{journal_id}", response_model=JournalEntryResponse)
async def get_journal(journal_id: int, user=Depends(get_current_user)):
    """Get a specific journal entry"""
    try:
        result = supabase.table("journals")\
            .select("*")\
            .eq("id", journal_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        
        return JournalEntryResponse(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/journal/{journal_id}", response_model=JournalEntryResponse)
async def update_journal(
    journal_id: int, 
    entry_update: JournalEntryUpdate, 
    user=Depends(get_current_user)
):
    """Update a journal entry"""
    try:
        # Get existing entry
        existing = supabase.table("journals")\
            .select("*")\
            .eq("id", journal_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        
        # Prepare update data
        update_data = {}
        if entry_update.content is not None:
            update_data["content"] = entry_update.content
            # Re-analyze sentiment if content changed
            sentiment_result = sentiment_analyzer.predict_sentiment(entry_update.content)
            update_data["sentiment"] = sentiment_result["sentiment"]
            update_data["mood_category"] = sentiment_result["label"]
        
        if entry_update.title is not None:
            update_data["title"] = entry_update.title
        
        # Update entry
        result = supabase.table("journals")\
            .update(update_data)\
            .eq("id", journal_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if result.data:
            return JournalEntryResponse(**result.data[0])
        else:
            raise HTTPException(status_code=500, detail="Failed to update journal entry")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/journal/{journal_id}")
async def delete_journal(journal_id: int, user=Depends(get_current_user)):
    """Delete a journal entry"""
    try:
        result = supabase.table("journals")\
            .delete()\
            .eq("id", journal_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if result.data:
            return {"message": "Journal entry deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Journal entry not found")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-sentiment", response_model=SentimentAnalysisResponse)
async def analyze_sentiment(text: str, user=Depends(get_current_user)):
    """Analyze sentiment of text without saving"""
    try:
        result = sentiment_analyzer.predict_sentiment(text)
        return SentimentAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train-model", response_model=ModelTrainingResponse)
async def train_model(user=Depends(get_current_user)):
    """Train the AI model on user's journal entries"""
    try:
        # Get user's journal entries
        result = supabase.table("journals")\
            .select("*")\
            .eq("user_id", user["id"])\
            .execute()
        
        if not result.data:
            return ModelTrainingResponse(
                status="no_data", 
                message="No journal entries found. Create some entries first."
            )
        
        # Train model
        training_result = sentiment_analyzer.train_model(result.data)
        return ModelTrainingResponse(**training_result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/insights", response_model=SentimentInsightsResponse)
async def get_insights(user=Depends(get_current_user)):
    """Get sentiment insights from user's journal entries"""
    try:
        # Get user's journal entries
        result = supabase.table("journals")\
            .select("*")\
            .eq("user_id", user["id"])\
            .order("created_at", desc=True)\
            .execute()
        
        if not result.data:
            return SentimentInsightsResponse(
                status="no_data", 
                message="No journal entries found"
            )
        
        # Generate insights
        insights = sentiment_analyzer.get_sentiment_insights(result.data)
        return SentimentInsightsResponse(**insights)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(user=Depends(get_current_user)):
    """Get user statistics"""
    try:
        # Get user's journal entries
        result = supabase.table("journals")\
            .select("*")\
            .eq("user_id", user["id"])\
            .order("created_at", desc=True)\
            .execute()
        
        if not result.data:
            return UserStatsResponse(
                total_entries=0,
                average_sentiment=0.0,
                positive_entries=0,
                negative_entries=0,
                neutral_entries=0,
                recent_trend="stable",
                mood_stability="stable"
            )
        
        # Calculate statistics
        sentiments = [entry["sentiment"] for entry in result.data]
        labels = [entry["mood_category"] for entry in result.data]
        
        total_entries = len(result.data)
        average_sentiment = sum(sentiments) / total_entries if total_entries > 0 else 0.0
        
        positive_entries = labels.count("positive")
        negative_entries = labels.count("negative")
        neutral_entries = labels.count("neutral")
        
        # Calculate recent trend (last 7 vs previous 7)
        recent_entries = result.data[:7] if len(result.data) >= 7 else result.data
        older_entries = result.data[7:14] if len(result.data) >= 14 else []
        
        recent_avg = sum(entry["sentiment"] for entry in recent_entries) / len(recent_entries)
        older_avg = sum(entry["sentiment"] for entry in older_entries) / len(older_entries) if older_entries else recent_avg
        
        recent_trend = "improving" if recent_avg > older_avg + 0.1 else "declining" if recent_avg < older_avg - 0.1 else "stable"
        
        # Calculate mood stability
        sentiment_std = (sum((s - average_sentiment) ** 2 for s in sentiments) / total_entries) ** 0.5
        mood_stability = "stable" if sentiment_std < 0.3 else "variable"
        
        last_entry_date = datetime.fromisoformat(result.data[0]["created_at"].replace('Z', '+00:00')) if result.data else None
        
        return UserStatsResponse(
            total_entries=total_entries,
            average_sentiment=average_sentiment,
            positive_entries=positive_entries,
            negative_entries=negative_entries,
            neutral_entries=neutral_entries,
            recent_trend=recent_trend,
            mood_stability=mood_stability,
            last_entry_date=last_entry_date
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
