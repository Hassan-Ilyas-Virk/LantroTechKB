import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../common/Loader';
import { FiTrendingUp } from 'react-icons/fi';

const TrendingTopics = () => {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await api.get('/ai/trending-topics');
        setTrends(res.data.trends || []);
      } catch (error) {
        console.error('Failed to fetch trends', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiTrendingUp color="var(--accent-blue)" /> Trending Topics (Last 30 Days)
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {trends && trends.map((trend, index) => (
          <div key={index} className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            {/* Background intensity based on mention count */}
            <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '8rem', fontWeight: 800, color: 'rgba(255,255,255,0.02)', lineHeight: 1 }}>
              #{index + 1}
            </div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-blue)' }}>{trend.topicName}</h4>
                <div className="badge badge-blue">Impact Score: {trend.mentionCount}/10</div>
              </div>
              <p className="text-secondary" style={{ fontSize: '0.95rem' }}>{trend.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics;
