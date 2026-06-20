import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../common/Loader';
import { FiAlertTriangle } from 'react-icons/fi';

const KnowledgeGapChart = () => {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGaps = async () => {
      try {
        const res = await api.get('/ai/knowledge-gaps');
        // The AI may return { gaps: [...] } or just [...] — handle both
        const raw = res.data;
        if (Array.isArray(raw)) {
          setGaps(raw);
        } else if (raw && Array.isArray(raw.gaps)) {
          setGaps(raw.gaps);
        } else if (raw && typeof raw === 'object') {
          // Try to find any array property
          const firstArray = Object.values(raw).find(v => Array.isArray(v));
          setGaps(firstArray || []);
        }
      } catch (err) {
        console.error('Failed to fetch knowledge gaps', err);
        setError(err.response?.data?.message || 'Failed to load knowledge gaps. Make sure you are logged in as admin.');
      } finally {
        setLoading(false);
      }
    };
    fetchGaps();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{error}</div>;
  if (gaps.length === 0) return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No knowledge gaps detected. Add more open questions for the AI to analyze.</div>;

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Identified Knowledge Gaps</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {gaps.map((gap, index) => (
          <div key={index} className="glass-card" style={{ padding: '1.5rem', borderLeft: `4px solid ${gap.severity === 'High' ? 'var(--accent-red)' : gap.severity === 'Medium' ? 'var(--accent-amber)' : 'var(--accent-blue)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{gap.topic}</h4>
              <span className={`badge badge-${gap.severity === 'High' ? 'red' : gap.severity === 'Medium' ? 'amber' : 'blue'}`}>
                {gap.severity} Severity
              </span>
            </div>
            <p className="text-secondary" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>{gap.description}</p>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <strong><FiAlertTriangle style={{ color: 'var(--accent-amber)', marginRight: '0.5rem' }}/> Recommendation:</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{gap.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeGapChart;
