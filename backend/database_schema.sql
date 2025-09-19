-- Sentiment Journal Database Schema for Supabase

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create journals table
CREATE TABLE IF NOT EXISTS journals (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    sentiment FLOAT NOT NULL DEFAULT 0.0,
    mood_category VARCHAR(20) NOT NULL DEFAULT 'neutral',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journals_user_id ON journals(user_id);
CREATE INDEX IF NOT EXISTS idx_journals_created_at ON journals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journals_sentiment ON journals(sentiment);
CREATE INDEX IF NOT EXISTS idx_journals_mood_category ON journals(mood_category);

-- Enable Row Level Security
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own journals" ON journals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journals" ON journals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journals" ON journals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journals" ON journals
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_journals_updated_at
    BEFORE UPDATE ON journals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create user_profiles table for additional user data
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, username, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create view for journal statistics
CREATE OR REPLACE VIEW journal_stats AS
SELECT 
    user_id,
    COUNT(*) as total_entries,
    AVG(sentiment) as average_sentiment,
    COUNT(CASE WHEN mood_category = 'positive' THEN 1 END) as positive_entries,
    COUNT(CASE WHEN mood_category = 'negative' THEN 1 END) as negative_entries,
    COUNT(CASE WHEN mood_category = 'neutral' THEN 1 END) as neutral_entries,
    MAX(created_at) as last_entry_date,
    MIN(created_at) as first_entry_date
FROM journals
GROUP BY user_id;

-- Grant access to the view
GRANT SELECT ON journal_stats TO authenticated;

-- Create function to get sentiment insights
CREATE OR REPLACE FUNCTION get_sentiment_insights(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_entries', COUNT(*),
        'average_sentiment', AVG(sentiment),
        'sentiment_std', STDDEV(sentiment),
        'positive_entries', COUNT(CASE WHEN mood_category = 'positive' THEN 1 END),
        'negative_entries', COUNT(CASE WHEN mood_category = 'negative' THEN 1 END),
        'neutral_entries', COUNT(CASE WHEN mood_category = 'neutral' THEN 1 END),
        'recent_entries', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'content', content,
                    'sentiment', sentiment,
                    'mood_category', mood_category,
                    'created_at', created_at
                )
            )
            FROM (
                SELECT id, content, sentiment, mood_category, created_at
                FROM journals
                WHERE user_id = user_uuid
                ORDER BY created_at DESC
                LIMIT 7
            ) recent
        )
    ) INTO result
    FROM journals
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_sentiment_insights(UUID) TO authenticated;

