from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class JournalEntryCreate(BaseModel):
    content: str
    title: Optional[str] = None

class JournalEntryResponse(BaseModel):
    id: int
    user_id: str
    content: str
    title: Optional[str] = None
    sentiment: float
    mood_category: str
    created_at: datetime
    
class JournalEntryUpdate(BaseModel):
    content: Optional[str] = None
    title: Optional[str] = None

class SentimentAnalysisResponse(BaseModel):
    sentiment: float
    label: str
    confidence: float
    method: str
    textblob_sentiment: Optional[float] = None
    textblob_label: Optional[str] = None

class ModelTrainingResponse(BaseModel):
    status: str
    accuracy: Optional[float] = None
    training_samples: Optional[int] = None
    test_samples: Optional[int] = None
    classification_report: Optional[Dict[str, Any]] = None
    message: Optional[str] = None

class SentimentInsightsResponse(BaseModel):
    status: str
    total_entries: Optional[int] = None
    average_sentiment: Optional[float] = None
    sentiment_std: Optional[float] = None
    sentiment_distribution: Optional[Dict[str, int]] = None
    recent_average: Optional[float] = None
    trend: Optional[str] = None
    mood_stability: Optional[str] = None
    message: Optional[str] = None

class UserStatsResponse(BaseModel):
    total_entries: int
    average_sentiment: float
    positive_entries: int
    negative_entries: int
    neutral_entries: int
    recent_trend: str
    mood_stability: str
    last_entry_date: Optional[datetime] = None

