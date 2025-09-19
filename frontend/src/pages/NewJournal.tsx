import { useState } from 'react';
import { postJournal } from '../utils/api';

export default function NewJournal() {
  const [content, setContent] = useState('');

  const submit = async () => {
    await postJournal(content);
    alert('Journal submitted!');
    setContent('');
  };

  return (
    <div>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <button onClick={submit}>Submit</button>
    </div>
  );
}
