import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiArrowRight, FiActivity } from 'react-icons/fi';
import api from '../services/api';
import QuestionCard from '../components/questions/QuestionCard';
import Loader from '../components/common/Loader';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchRecentQuestions = async () => {
      try {
        // Fetch 5 most recent questions
        const res = await api.get('/questions?limit=5');
        setQuestions(res.data.data);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentQuestions();
  }, []);

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="glass-panel responsive-flex" style={{ 
        padding: '3rem 2rem', 
        marginBottom: '2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, var(--accent-text), #065f5c)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 10px 30px rgba(10, 142, 138, 0.2)'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#ffffff' }}>
            Welcome back, <span style={{ color: 'var(--accent-amber)' }}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '600px', color: 'rgba(255, 255, 255, 0.9)' }}>
            Find answers to internal questions, share your knowledge, and help the team grow. What would you like to know today?
          </p>
        </div>
        <div>
          <Link to="/ask" style={{ 
            padding: '0.8rem 1.5rem', 
            fontSize: '1.1rem', 
            background: 'var(--accent-amber)',
            color: '#000',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 15px rgba(255, 189, 36, 0.3)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <FiPlus /> Ask a Question
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        
        {/* Left Col - Feed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiActivity color="var(--accent-text)" /> Recent Activity
            </h2>
            <Link to="/questions" style={{ color: 'var(--accent-text)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>
              View all <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : questions.length > 0 ? (
            questions.map(q => <QuestionCard key={q._id} question={q} />)
          ) : (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No questions found. Be the first to ask!
            </div>
          )}
        </div>

        {/* Right Col - Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Your Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-secondary">Reputation</span>
                <strong style={{ color: 'var(--accent-amber)' }}>{user?.reputation || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-secondary">Questions Asked</span>
                <strong>{user?.questionsCount || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-secondary">Answers Given</span>
                <strong>{user?.answersCount || 0}</strong>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--accent-blue-light), var(--accent-amber-light))' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Knowledge Tip</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
              Before asking a question, try searching the knowledge base. Chances are, someone has already answered it!
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HomePage;
