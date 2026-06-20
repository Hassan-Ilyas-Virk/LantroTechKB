import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import QuestionCard from '../components/questions/QuestionCard';
import Loader from '../components/common/Loader';
import { FiFilter, FiPlus } from 'react-icons/fi';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const query = searchParams.get('search') || '';
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'newest';
  const unanswered = searchParams.get('unanswered') || 'false';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        let url = `/questions?page=${page}&limit=10`;
        if (query) url += `&search=${encodeURIComponent(query)}`;
        if (tag) url += `&tag=${tag}`;
        if (sort) url += `&sort=${sort}`;
        if (unanswered === 'true') url += `&unanswered=true`;

        const res = await api.get(url);
        setQuestions(res.data.data);
        setPagination({
          page: res.data.page,
          pages: res.data.pages,
          total: res.data.total
        });
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [query, tag, sort, unanswered, page]);

  const handleFilterChange = (key, value) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    // Reset to page 1 on filter change
    searchParams.set('page', '1');
    navigate(`/questions?${searchParams.toString()}`);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>All Questions</h1>
          <p className="text-secondary">{pagination.total} questions found</p>
        </div>
        <Link to="/ask" className="btn-primary">
          <FiPlus /> Ask Question
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel" style={{ 
        padding: '1rem', 
        marginBottom: '2rem', 
        display: 'flex', 
        gap: '1rem', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        background: 'linear-gradient(135deg, var(--accent-text), #065f5c)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 4px 15px rgba(10, 142, 138, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.9)' }}>
          <FiFilter /> Filters:
        </div>
        
        <select 
          className="form-control" 
          style={{ width: 'auto', background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.5rem' }}
          value={sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
        >
          <option value="newest" style={{ color: '#000' }}>Newest</option>
          <option value="popular" style={{ color: '#000' }}>Most Popular</option>
          <option value="oldest" style={{ color: '#000' }}>Oldest</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#ffffff' }}>
          <input 
            type="checkbox" 
            checked={unanswered === 'true'}
            onChange={(e) => handleFilterChange('unanswered', e.target.checked ? 'true' : '')}
          />
          <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Unanswered only</span>
        </label>

        {query && (
          <div className="badge badge-blue" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            Search: "{query}"
            <button onClick={() => handleFilterChange('search', '')} style={{ color: 'inherit' }}>&times;</button>
          </div>
        )}

        {tag && (
          <div className="badge badge-green" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            Tag Filter Active
            <button onClick={() => handleFilterChange('tag', '')} style={{ color: 'inherit' }}>&times;</button>
          </div>
        )}
      </div>

      {/* Question List */}
      <div>
        {loading ? (
          <Loader />
        ) : questions.length > 0 ? (
          questions.map(q => <QuestionCard key={q._id} question={q} />)
        ) : (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>No questions found</h3>
            <p className="text-secondary">Try adjusting your filters or search query.</p>
            <button onClick={() => navigate('/questions')} className="btn-secondary" style={{ marginTop: '1rem' }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => handleFilterChange('page', p.toString())}
              className={`btn-${p === pagination.page ? 'primary' : 'secondary'}`}
              style={{ width: '40px', height: '40px', padding: 0 }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;
