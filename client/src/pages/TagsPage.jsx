import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { FiCheckCircle } from 'react-icons/fi';

const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        let url = '/tags?sort=popular';
        if (filter !== 'all') url += `&category=${filter}`;
        if (search) url += `&search=${search}`;
        
        const res = await api.get(url);
        setTags(res.data);
      } catch (error) {
        console.error('Failed to fetch tags', error);
      } finally {
        setLoading(false);
      }
    };

    // Small debounce for search
    const timeoutId = setTimeout(() => {
      fetchTags();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filter, search]);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Tags</h1>
        <p className="text-secondary">
          A tag is a keyword or label that categorizes your question with other, similar questions. 
          Using the right tags makes it easier for others to find and answer your question.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Filter by tag name..." 
          className="form-control" 
          style={{ maxWidth: '300px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'technical', 'hr', 'process', 'general'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={filter === cat ? 'btn-primary' : 'btn-secondary'}
              style={{ textTransform: 'capitalize', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : tags.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {tags.map(tag => (
            <div key={tag._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span 
                  className="badge" 
                  style={{ 
                    background: `${tag.color || '#3b82f6'}20`, 
                    color: tag.color || '#3b82f6',
                    border: `1px solid ${tag.color || '#3b82f6'}40`,
                    fontSize: '0.9rem', padding: '0.4rem 0.8rem'
                  }}
                >
                  #{tag.name}
                </span>
                {tag.isOfficial && (
                  <span title="Official Tag" style={{ color: 'var(--accent-green)' }}><FiCheckCircle size={18} /></span>
                )}
              </div>
              
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                {tag.description || 'No description provided for this tag.'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span className="text-muted">{tag.questionsCount} questions</span>
                <Link to={`/questions?tag=${tag._id}`} style={{ color: 'var(--accent-text)' }}>
                  View questions
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem' }}>No tags found</h3>
          <p className="text-secondary">Try a different search term or category.</p>
        </div>
      )}
    </div>
  );
};

export default TagsPage;
