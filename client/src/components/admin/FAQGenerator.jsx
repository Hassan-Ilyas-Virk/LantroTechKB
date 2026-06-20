import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../common/Loader';
import ReactMarkdown from 'react-markdown';
import { FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FAQGenerator = () => {
  const [faqData, setFaqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const res = await api.get('/ai/auto-faq');
        setFaqData(res.data.markdown);
      } catch (err) {
        console.error('Failed to fetch FAQ', err);
        setError(err.response?.data?.message || 'Failed to generate FAQ. Make sure you are logged in as admin and there are resolved questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchFAQ();
  }, []);

  const copyToClipboard = () => {
    if (faqData) {
      navigator.clipboard.writeText(faqData);
      toast.success('Copied to clipboard');
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem' }}>Auto-Generated Monthly FAQ</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={copyToClipboard} className="btn-secondary" title="Copy Markdown">
            <FiCopy /> Copy
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem', maxHeight: '600px', overflowY: 'auto' }}>
        <div className="markdown-body">
          <ReactMarkdown>{faqData || 'No FAQ data generated. Ensure there are resolved questions with accepted answers.'}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default FAQGenerator;
