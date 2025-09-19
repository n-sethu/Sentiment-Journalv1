import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

export const api = axios.create({
  baseURL: 'http://localhost:8000'
});

export const postJournal = async (content: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("No auth token");
  return api.post('/journal', { content }, { headers: { Authorization: `Bearer ${token}` } });
};

export const getJournals = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("No auth token");
  return api.get('/journals', { headers: { Authorization: `Bearer ${token}` } });
};
