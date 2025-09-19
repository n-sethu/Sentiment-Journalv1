import type { FC } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Heart, Frown, Meh } from 'lucide-react';
import type { JournalEntry } from '../src/utils/api';
import Card from './card';
import Button from './button';
import { styles } from './journal-card/styles';

interface JournalCardProps {
  entry: JournalEntry;
  onEdit?: (entry: JournalEntry) => void;
  onDelete?: (id: number) => void;
}

const JournalCard: FC<JournalCardProps> = ({
  entry,
  onEdit,
  onDelete
}) => {
  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive':
        return <Heart className={styles.moodIcon.positive} />;
      case 'negative':
        return <Frown className={styles.moodIcon.negative} />;
      default:
        return <Meh className={styles.moodIcon.neutral} />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive':
        return styles.moodColors.positive;
      case 'negative':
        return styles.moodColors.negative;
      default:
        return styles.moodColors.neutral;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  return (
    <Card variant="outlined" className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          {entry.title && (
            <h3 className={styles.title}>{entry.title}</h3>
          )}
          <div className={styles.dateTime}>
            <span className={styles.date}>{formatDate(entry.created_at)}</span>
            <span className={styles.time}>{formatTime(entry.created_at)}</span>
          </div>
        </div>
        <div className={styles.actions}>
          {onEdit && (
            <Button
              variant="ghost"
              size="small"
              onClick={() => onEdit(entry)}
              className={styles.actionButton}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="small"
              onClick={() => onDelete(entry.id)}
              className={styles.actionButton}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className={styles.content}>
        <p className={styles.text}>{entry.content}</p>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.moodSection}>
          <div className={styles.moodIndicator}>
            {getMoodIcon(entry.mood_category)}
            <span className={`${styles.moodLabel} ${getMoodColor(entry.mood_category)}`}>
              {entry.mood_category}
            </span>
          </div>
          <div className={styles.sentimentScore}>
            <span className={styles.scoreLabel}>Sentiment:</span>
            <span className={`${styles.score} ${getMoodColor(entry.mood_category)}`}>
              {entry.sentiment.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default JournalCard;
