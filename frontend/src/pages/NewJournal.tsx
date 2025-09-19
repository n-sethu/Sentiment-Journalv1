import React, { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { journalApi } from '../utils/api';
import type { JournalEntryCreate } from '../utils/api';
import Button from '../../components/button';
import Input from '../../components/input';
import Textarea from '../../components/textarea';
import Card from '../../components/card';
import Navbar from '../../components/Navbar';
import { styles } from './new-journal/styles';

const NewJournal: FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<JournalEntryCreate>({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentimentAnalysis, setSentimentAnalysis] = useState<any>(null);

  const handleInputChange = (field: keyof JournalEntryCreate) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const analyzeSentiment = async () => {
    if (!formData.content.trim()) return;

    try {
      const response = await journalApi.analyzeSentiment(formData.content);
      setSentimentAnalysis(response.data);
    } catch (err) {
      console.error('Error analyzing sentiment:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      setError('Please enter some content for your journal entry');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await journalApi.createJournal(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create journal entry');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      <Navbar />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>New Journal Entry</h1>
          <p className={styles.subtitle}>
            Write about your day and let AI analyze your emotions
          </p>
        </div>

        <Card variant="elevated" className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Title (Optional)"
              placeholder="Give your entry a title..."
              value={formData.title}
              onChange={handleInputChange('title')}
              className={styles.titleInput}
            />

            <Textarea
              label="Your Thoughts"
              placeholder="Write about your day, feelings, experiences, or anything on your mind..."
              value={formData.content}
              onChange={handleInputChange('content')}
              rows={8}
              required
              className={styles.contentInput}
            />

            {formData.content && (
              <div className={styles.analysisSection}>
                <Button
                  type="button"
                  variant="outline"
                  size="small"
                  onClick={analyzeSentiment}
                  className={styles.analyzeButton}
                >
                  Analyze Sentiment
                </Button>

                {sentimentAnalysis && (
                  <div className={styles.sentimentResult}>
                    <div className={styles.sentimentInfo}>
                      <span className={styles.sentimentLabel}>Mood:</span>
                      <span className={`${styles.sentimentValue} ${styles.sentimentColors[sentimentAnalysis.label as keyof typeof styles.sentimentColors]}`}>
                        {sentimentAnalysis.label}
                      </span>
                      <span className={styles.confidenceLabel}>Confidence:</span>
                      <span className={styles.confidenceValue}>
                        {(sentimentAnalysis.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className={styles.methodInfo}>
                      Analysis method: {sentimentAnalysis.method}
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <div className={styles.buttonGroup}>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className={styles.submitButton}
              >
                Save Entry
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default NewJournal;
