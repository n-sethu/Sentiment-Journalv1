import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Brain, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { journalApi } from '../utils/api';
import type { UserStats, SentimentInsights, JournalEntry } from '../utils/api';
import Card from '../../components/card';
import Button from '../../components/button';
import Navbar from '../../components/Navbar';
import { styles } from './stats/styles';

const Stats: FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [insights, setInsights] = useState<SentimentInsights | null>(null);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsResponse, insightsResponse, journalsResponse] = await Promise.all([
        journalApi.getStats(),
        journalApi.getInsights(),
        journalApi.getJournals(50, 0)
      ]);
      
      setStats(statsResponse.data);
      setInsights(insightsResponse.data);
      setJournals(journalsResponse.data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainModel = async () => {
    try {
      setLoading(true);
      await journalApi.trainModel();
      // Reload data after training
      await loadData();
    } catch (err) {
      console.error('Error training model:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Prepare chart data
  const moodDistributionData = insights?.sentiment_distribution ? [
    { name: 'Positive', value: insights.sentiment_distribution.positive || 0, color: '#10B981' },
    { name: 'Negative', value: insights.sentiment_distribution.negative || 0, color: '#EF4444' },
    { name: 'Neutral', value: insights.sentiment_distribution.neutral || 0, color: '#6B7280' },
  ] : [];

  const sentimentOverTimeData = journals.slice(0, 30).reverse().map((journal, index) => ({
    day: index + 1,
    sentiment: journal.sentiment,
    mood: journal.mood_category,
  }));

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading your statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Your Statistics</h1>
            <p className={styles.subtitle}>
              Insights into your emotional patterns and mental health journey
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleTrainModel}
            loading={loading}
            className={styles.trainButton}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Train AI Model
          </Button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {stats && (
          <div className={styles.statsGrid}>
            <Card variant="outlined" className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statIcon}>
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className={styles.statLabel}>Total Entries</p>
                  <p className={styles.statValue}>{stats.total_entries}</p>
                </div>
              </div>
            </Card>

            <Card variant="outlined" className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statIcon}>
                  <div className={`w-6 h-6 rounded-full ${styles.sentimentIcon}`} />
                </div>
                <div>
                  <p className={styles.statLabel}>Average Sentiment</p>
                  <p className={styles.statValue}>
                    {stats.average_sentiment.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="outlined" className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statIcon}>
                  {getTrendIcon(stats.recent_trend)}
                </div>
                <div>
                  <p className={styles.statLabel}>Recent Trend</p>
                  <p className={`${styles.statValue} ${getTrendColor(stats.recent_trend)}`}>
                    {stats.recent_trend}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="outlined" className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statIcon}>
                  <div className={`w-6 h-6 rounded-full ${styles.stabilityIcon}`} />
                </div>
                <div>
                  <p className={styles.statLabel}>Mood Stability</p>
                  <p className={styles.statValue}>{stats.mood_stability}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className={styles.chartsGrid}>
          {moodDistributionData.length > 0 && (
            <Card variant="outlined" className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Mood Distribution</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {moodDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {sentimentOverTimeData.length > 0 && (
            <Card variant="outlined" className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Sentiment Over Time</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sentimentOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[-1, 1]} />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(2), 'Sentiment']}
                      labelFormatter={(day) => `Day ${day}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sentiment" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>

        {insights && insights.status === 'success' && (
          <Card variant="outlined" className={styles.insightsCard}>
            <h3 className={styles.insightsTitle}>AI Insights</h3>
            <div className={styles.insightsContent}>
              <div className={styles.insightItem}>
                <span className={styles.insightLabel}>Overall Mood Trend:</span>
                <span className={`${styles.insightValue} ${getTrendColor(insights.trend || 'stable')}`}>
                  {insights.trend || 'stable'}
                </span>
              </div>
              <div className={styles.insightItem}>
                <span className={styles.insightLabel}>Mood Stability:</span>
                <span className={styles.insightValue}>{insights.mood_stability || 'stable'}</span>
              </div>
              <div className={styles.insightItem}>
                <span className={styles.insightLabel}>Recent Average Sentiment:</span>
                <span className={styles.insightValue}>
                  {insights.recent_average?.toFixed(2) || '0.00'}
                </span>
              </div>
              {insights.sentiment_std && (
                <div className={styles.insightItem}>
                  <span className={styles.insightLabel}>Sentiment Variability:</span>
                  <span className={styles.insightValue}>
                    {insights.sentiment_std.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Stats;
