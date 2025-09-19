import { useEffect, useState } from 'react';
import { getJournals } from '../utils/api';

export default function Dashboard() {
  const [journals, setJournals] = useState<{ content: string }[]>([]);

  useEffect(() => {
    getJournals().then(res => setJournals(res.data));
  }, []);

  return (
    <div>
      <h1>Your Journals</h1>
      {journals.map((j, i) => <div key={i}>{j.content}</div>)}
    </div>
  );
}
