import pickle
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from textblob import TextBlob
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import re
import os
from typing import List, Dict, Tuple, Optional
import logging

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self.model_path = "sentiment_model.pkl"
        self.vectorizer_path = "vectorizer.pkl"
        self.is_trained = False
        
    def preprocess_text(self, text: str) -> str:
        """Preprocess text for sentiment analysis"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens 
                 if token not in self.stop_words and len(token) > 2]
        
        return ' '.join(tokens)
    
    def get_sentiment_label(self, polarity: float) -> str:
        """Convert polarity score to sentiment label"""
        if polarity > 0.1:
            return "positive"
        elif polarity < -0.1:
            return "negative"
        else:
            return "neutral"
    
    def train_model(self, journal_entries: List[Dict]) -> Dict:
        """Train the sentiment analysis model on user's journal entries"""
        try:
            if len(journal_entries) < 10:
                return {"status": "insufficient_data", "message": "Need at least 10 journal entries to train the model"}
            
            # Prepare data
            texts = []
            labels = []
            
            for entry in journal_entries:
                content = entry.get('content', '')
                sentiment = entry.get('sentiment', 0.0)
                
                if content:
                    processed_text = self.preprocess_text(content)
                    texts.append(processed_text)
                    labels.append(self.get_sentiment_label(sentiment))
            
            if len(texts) < 10:
                return {"status": "insufficient_data", "message": "Need at least 10 valid journal entries"}
            
            # Vectorize texts
            X = self.vectorizer.fit_transform(texts)
            y = np.array(labels)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Train model
            self.model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Save model and vectorizer
            self.save_model()
            
            self.is_trained = True
            
            return {
                "status": "success",
                "accuracy": accuracy,
                "training_samples": len(texts),
                "test_samples": len(X_test),
                "classification_report": classification_report(y_test, y_pred, output_dict=True)
            }
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def predict_sentiment(self, text: str) -> Dict:
        """Predict sentiment of a given text"""
        try:
            if not self.is_trained:
                # Fallback to TextBlob if model not trained
                blob = TextBlob(text)
                polarity = blob.sentiment.polarity
                return {
                    "sentiment": polarity,
                    "label": self.get_sentiment_label(polarity),
                    "confidence": abs(polarity),
                    "method": "textblob"
                }
            
            # Use trained model
            processed_text = self.preprocess_text(text)
            X = self.vectorizer.transform([processed_text])
            
            prediction = self.model.predict(X)[0]
            probabilities = self.model.predict_proba(X)[0]
            confidence = max(probabilities)
            
            # Also get TextBlob sentiment for comparison
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            
            return {
                "sentiment": polarity,
                "label": prediction,
                "confidence": confidence,
                "method": "trained_model",
                "textblob_sentiment": polarity,
                "textblob_label": self.get_sentiment_label(polarity)
            }
            
        except Exception as e:
            logger.error(f"Error predicting sentiment: {str(e)}")
            # Fallback to TextBlob
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            return {
                "sentiment": polarity,
                "label": self.get_sentiment_label(polarity),
                "confidence": abs(polarity),
                "method": "textblob_fallback"
            }
    
    def save_model(self):
        """Save the trained model and vectorizer"""
        try:
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.model, f)
            with open(self.vectorizer_path, 'wb') as f:
                pickle.dump(self.vectorizer, f)
            logger.info("Model and vectorizer saved successfully")
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
    
    def load_model(self) -> bool:
        """Load the trained model and vectorizer"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                with open(self.vectorizer_path, 'rb') as f:
                    self.vectorizer = pickle.load(f)
                self.is_trained = True
                logger.info("Model and vectorizer loaded successfully")
                return True
            return False
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False
    
    def get_sentiment_insights(self, journal_entries: List[Dict]) -> Dict:
        """Generate insights from journal entries"""
        try:
            if not journal_entries:
                return {"status": "no_data", "message": "No journal entries found"}
            
            sentiments = [entry.get('sentiment', 0) for entry in journal_entries]
            labels = [self.get_sentiment_label(sentiment) for sentiment in sentiments]
            
            # Calculate statistics
            avg_sentiment = np.mean(sentiments)
            sentiment_std = np.std(sentiments)
            
            # Count sentiment distribution
            sentiment_counts = {}
            for label in labels:
                sentiment_counts[label] = sentiment_counts.get(label, 0) + 1
            
            # Find trends (last 7 entries vs previous)
            recent_entries = journal_entries[-7:] if len(journal_entries) >= 7 else journal_entries
            older_entries = journal_entries[:-7] if len(journal_entries) >= 14 else []
            
            recent_avg = np.mean([entry.get('sentiment', 0) for entry in recent_entries])
            older_avg = np.mean([entry.get('sentiment', 0) for entry in older_entries]) if older_entries else recent_avg
            
            trend = "improving" if recent_avg > older_avg + 0.1 else "declining" if recent_avg < older_avg - 0.1 else "stable"
            
            return {
                "status": "success",
                "total_entries": len(journal_entries),
                "average_sentiment": avg_sentiment,
                "sentiment_std": sentiment_std,
                "sentiment_distribution": sentiment_counts,
                "recent_average": recent_avg,
                "trend": trend,
                "mood_stability": "stable" if sentiment_std < 0.3 else "variable"
            }
            
        except Exception as e:
            logger.error(f"Error generating insights: {str(e)}")
            return {"status": "error", "message": str(e)}

# Global instance
sentiment_analyzer = SentimentAnalyzer()

