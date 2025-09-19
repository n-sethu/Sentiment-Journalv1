import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Types
export interface JournalEntry {
  id: number;
  user_id: string;
  content: string;
  title?: string;
  sentiment: number;
  mood_category: string;
  created_at: string;
}

export interface JournalEntryCreate {
  content: string;
  title?: string;
}

export interface JournalEntryUpdate {
  content?: string;
  title?: string;
}

export interface SentimentAnalysis {
  sentiment: number;
  label: string;
  confidence: number;
  method: string;
  textblob_sentiment?: number;
  textblob_label?: string;
}

export interface UserStats {
  total_entries: number;
  average_sentiment: number;
  positive_entries: number;
  negative_entries: number;
  neutral_entries: number;
  recent_trend: string;
  mood_stability: string;
  last_entry_date?: string;
}

export interface SentimentInsights {
  status: string;
  total_entries?: number;
  average_sentiment?: number;
  sentiment_std?: number;
  sentiment_distribution?: Record<string, number>;
  recent_average?: number;
  trend?: string;
  mood_stability?: string;
  message?: string;
}

export interface ModelTrainingResult {
  status: string;
  accuracy?: number;
  training_samples?: number;
  test_samples?: number;
  classification_report?: Record<string, any>;
  message?: string;
}

// API functions
export const journalApi = {
  // Journal entries
  getJournals: (limit = 50, offset = 0) => 
    api.get<JournalEntry[]>(`/journals?limit=${limit}&offset=${offset}`),
  
  getJournal: (id: number) => 
    api.get<JournalEntry>(`/journal/${id}`),
  
  createJournal: (data: JournalEntryCreate) => 
    api.post<JournalEntry>('/journal', data),
  
  updateJournal: (id: number, data: JournalEntryUpdate) => 
    api.put<JournalEntry>(`/journal/${id}`, data),
  
  deleteJournal: (id: number) => 
    api.delete(`/journal/${id}`),
  
  // Sentiment analysis
  analyzeSentiment: (text: string) => 
    api.post<SentimentAnalysis>('/analyze-sentiment', { text }),
  
  // AI model training
  trainModel: () => 
    api.post<ModelTrainingResult>('/train-model'),
  
  // Insights and stats
  getInsights: () => 
    api.get<SentimentInsights>('/insights'),
  
  getStats: () => 
    api.get<UserStats>('/stats'),
};

// Legacy functions for backward compatibility
export const postJournal = async (content: string) => {
  return journalApi.createJournal({ content });
};

export const getJournals = async () => {
  return journalApi.getJournals();
};
