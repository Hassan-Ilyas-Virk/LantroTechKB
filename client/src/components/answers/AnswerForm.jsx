import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

const AnswerForm = ({ onSubmit, isSubmitting }) => {
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    onSubmit(body);
    setBody('');
    setPreview(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Your Answer</h3>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button 
          onClick={() => setPreview(false)}
          style={{ 
            background: 'none', border: 'none', 
            color: !preview ? 'var(--accent-blue)' : 'var(--text-secondary)',
            borderBottom: !preview ? '2px solid var(--accent-blue)' : '2px solid transparent',
            padding: '0.5rem', fontWeight: 500
          }}
        >
          Write
        </button>
        <button 
          onClick={() => setPreview(true)}
          style={{ 
            background: 'none', border: 'none', 
            color: preview ? 'var(--accent-blue)' : 'var(--text-secondary)',
            borderBottom: preview ? '2px solid var(--accent-blue)' : '2px solid transparent',
            padding: '0.5rem', fontWeight: 500
          }}
        >
          Preview
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {!preview ? (
          <textarea 
            className="form-control" 
            style={{ minHeight: '200px', resize: 'vertical', marginBottom: '1rem', fontFamily: 'monospace' }}
            placeholder="Type your answer here. Markdown is supported."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          ></textarea>
        ) : (
          <div className="markdown-body glass-card" style={{ padding: '1rem', minHeight: '200px', marginBottom: '1rem' }}>
            {body ? <ReactMarkdown>{body}</ReactMarkdown> : <p className="text-muted">Nothing to preview</p>}
          </div>
        )}

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isSubmitting || !body.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FiSend /> {isSubmitting ? 'Posting...' : 'Post Answer'}
        </button>
      </form>
    </div>
  );
};

export default AnswerForm;
