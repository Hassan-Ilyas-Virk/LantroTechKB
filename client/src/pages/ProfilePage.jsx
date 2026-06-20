import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/common/Loader';
import QuestionCard from '../components/questions/QuestionCard';

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'answers'

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [profileRes, questionsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/users/${id}/questions`)
        ]);
        setProfile(profileRes.data);
        setQuestions(questionsRes.data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [id]);

  if (loading) return <Loader />;
  if (!profile) return <div className="page-container">User not found</div>;

  return (
    <div className="page-container">
      {/* Profile Header */}
      <div className="glass-panel responsive-flex" style={{ padding: '3rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ 
          width: '100px', height: '100px', 
          borderRadius: '50%', 
          background: 'var(--accent-blue)', 
          color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', fontWeight: 600,
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
        }}>
          {profile.avatar}
        </div>
        
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{profile.name}</h1>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)' }}>
            <span>{profile.department}</span>
            <span>•</span>
            <span style={{ color: 'var(--accent-amber)', fontWeight: 500 }}>{profile.reputation} Reputation</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{profile.questionsCount}</div>
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>Questions</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{profile.answersCount}</div>
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>Answers</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => setActiveTab('questions')}
          style={{ 
            padding: '1rem 2rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'questions' ? '2px solid var(--accent-blue)' : '2px solid transparent',
            color: activeTab === 'questions' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 500
          }}
        >
          Questions ({profile.questionsCount})
        </button>
        <button 
          onClick={() => setActiveTab('answers')}
          style={{ 
            padding: '1rem 2rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'answers' ? '2px solid var(--accent-blue)' : '2px solid transparent',
            color: activeTab === 'answers' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 500
          }}
        >
          Answers ({profile.answersCount})
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'questions' && (
          questions.length > 0 ? (
            questions.map(q => <QuestionCard key={q._id} question={q} />)
          ) : (
            <p className="text-muted text-center" style={{ padding: '2rem' }}>No questions asked yet.</p>
          )
        )}
        
        {activeTab === 'answers' && (
          <p className="text-muted text-center" style={{ padding: '2rem' }}>Answer history view coming soon...</p>
        )}
      </div>

    </div>
  );
};

export default ProfilePage;
