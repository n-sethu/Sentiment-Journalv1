import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { journalApi } from '../utils/api';
import type { JournalEntry, UserStats } from '../utils/api';
import JournalCard from '../../components/JournalCard';
import Card from '../../components/card';
import Button from '../../components/button';
import Navbar from '../../components/Navbar';
import { styles } from './dashboard/styles';

const Dashboard: FC = () => {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [journalsResponse, statsResponse] = await Promise.all([
        journalApi.getJournals(10, 0),
        journalApi.getStats()
      ]);
      
      setJournals(journalsResponse.data);
      setStats(statsResponse.data);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJournal = async (id: number) => {
    try {
      await journalApi.deleteJournal(id);
      setJournals(prev => prev.filter(j => j.id !== id));
      // Reload stats after deletion
      const statsResponse = await journalApi.getStats();
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Error deleting journal:', err);
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

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading your journal...</p>
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
            <h1 className={styles.title}>Your Journal Dashboard</h1>
            <p className={styles.subtitle}>
              Track your emotions and gain insights into your mental well-being
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link to="/new-journal">
              <Button variant="primary" className={styles.newEntryButton}>
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
            </Link>
            <Link to="/stats">
              <Button variant="outline" className={styles.statsButton}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Stats
              </Button>
            </Link>
          </div>
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

        <div className={styles.journalsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Entries</h2>
            {journals.length > 0 && (
              <Link to="/stats" className={styles.viewAllLink}>
                View All
              </Link>
            )}
          </div>

          {journals.length === 0 ? (
            <Card variant="outlined" className={styles.emptyState}>
              <div className={styles.emptyContent}>
                <Brain className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No journal entries yet</h3>
                <p className={styles.emptyText}>
                  Start your mental health journey by writing your first journal entry.
                </p>
                <Link to="/new-journal">
                  <Button variant="primary" className={styles.emptyButton}>
                    <Plus className="w-4 h-4 mr-2" />
                    Write Your First Entry
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className={styles.journalsGrid}>
              {journals.map((journal) => (
                <JournalCard
                  key={journal.id}
                  entry={journal}
                  onDelete={handleDeleteJournal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
