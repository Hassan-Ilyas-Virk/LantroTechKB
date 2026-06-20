import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiChevronUp, FiChevronDown, FiClock, FiEye, FiCheckCircle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Tag from '../components/common/Tag';
import AnswerCard from '../components/answers/AnswerCard';
import AnswerForm from '../components/answers/AnswerForm';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestionAndAnswers = async () => {
      setLoading(true);
      try {
        const [qRes, aRes] = await Promise.all([
          api.get(`/questions/${id}`),
          api.get(`/questions/${id}/answers`)
        ]);
        setQuestion(qRes.data);
        setAnswers(aRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
        toast.error('Question not found');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionAndAnswers();
  }, [id, refetchTrigger]);

  const handleQuestionVote = async (type) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      const res = await api.post(`/questions/${id}/vote`, { type });
      setQuestion(prev => ({ 
        ...prev, 
        voteCount: res.data.voteCount,
        upvotes: res.data.upvotes,
        downvotes: res.data.downvotes
      }));
    } catch (error) {
      toast.error('Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleAnswerSubmit = async (body) => {
    setIsSubmittingAnswer(true);
    try {
      const res = await api.post(`/questions/${id}/answers`, { body });
      setAnswers(prev => [res.data, ...prev]);
      setQuestion(prev => ({ ...prev, answersCount: prev.answersCount + 1 }));
      toast.success('Answer posted successfully');
      
      // Request AI Verification in background
      api.post('/ai/verify-answer', { answerId: res.data._id })
        .then(() => setRefetchTrigger(prev => prev + 1))
        .catch(err => console.error("AI Verification failed", err));

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post answer');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleAnswerUpdate = (answerId, updatedAnswer) => {
    if (answerId === 'REFETCH') {
      setRefetchTrigger(prev => prev + 1);
    } else {
      setAnswers(prev => prev.map(a => a._id === answerId ? updatedAnswer : a));
    }
  };

  const handleQuestionDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      toast.success('Question deleted successfully');
      navigate('/questions');
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  if (loading) return <Loader />;
  if (!question) return <div className="page-container">Question not found</div>;

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      
      {/* Question Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', lineHeight: 1.3 }}>{question.title}</h1>
        
        <div style={{ display: 'flex', gap: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiClock /> Asked {formatDistanceToNow(new Date(question.createdAt))} ago
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiEye /> {question.views} views
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiCheckCircle color={question.status === 'resolved' ? 'var(--accent-green)' : 'currentColor'} /> 
            Status: <span style={{ textTransform: 'capitalize', color: question.status === 'resolved' ? 'var(--accent-green)' : 'inherit' }}>{question.status}</span>
          </span>
        </div>
      </div>

      {/* Question Body */}
      <div className="glass-card" style={{ 
        padding: '2rem', 
        marginBottom: '3rem', 
        display: 'flex', 
        gap: '2rem',
        borderTop: '4px solid var(--accent-blue)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        
        {/* Voting Column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minWidth: '40px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
            <button onClick={() => handleQuestionVote('upvote')} style={{ color: question.upvotes?.includes(user?._id) ? 'var(--accent-green)' : 'var(--text-secondary)', padding: '0.2rem' }}>
              <FiChevronUp size={32} />
            </button>
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: question.upvotes?.includes(user?._id) ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
              {question.upvotes?.length || 0}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: question.downvotes?.includes(user?._id) ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
              {question.downvotes?.length || 0}
            </span>
            <button onClick={() => handleQuestionVote('downvote')} style={{ color: question.downvotes?.includes(user?._id) ? 'var(--accent-red)' : 'var(--text-secondary)', padding: '0.2rem' }}>
              <FiChevronDown size={32} />
            </button>
          </div>

        </div>

        {/* Content Column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          
          {/* Author Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ 
            width: '28px', height: '28px', 
            borderRadius: '50%', 
            background: 'var(--accent-blue)', 
            color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: '0.8rem'
          }}>
            {question.author?.avatar}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to={`/profile/${question.author?._id}`} style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              {question.author?.name}
            </Link>
            <span style={{ color: 'var(--accent-green-hover)', fontWeight: 600, fontSize: '0.8rem' }}>
              {question.author?.reputation} <span style={{fontWeight: 400, color: 'var(--text-muted)'}}>rep</span>
            </span>
            <span className="text-muted" style={{ fontSize: '0.8rem', marginLeft: '0.25rem' }}>
              • asked {formatDistanceToNow(new Date(question.createdAt))} ago
            </span>
          </div>

          {/* Edit/Delete Controls */}
          {(user?._id === question.author?._id || user?.role === 'admin') && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <Link to={`/questions/${id}/edit`} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>Edit</Link>
              <button onClick={handleQuestionDelete} className="btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>Delete</button>
            </div>
          )}
        </div>

          <div className="markdown-body" style={{ marginBottom: '2rem' }}>
            <ReactMarkdown>{question.body}</ReactMarkdown>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {question.tags?.map(tag => <Tag key={tag._id} tag={tag} />)}
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {question.answersCount} {question.answersCount === 1 ? 'Answer' : 'Answers'}
        </h2>

        {answers.map(answer => (
          <AnswerCard 
            key={answer._id} 
            answer={answer} 
            questionAuthorId={question.author?._id}
            onUpdate={handleAnswerUpdate}
          />
        ))}

        <AnswerForm onSubmit={handleAnswerSubmit} isSubmitting={isSubmittingAnswer} />
      </div>

    </div>
  );
};

export default QuestionDetailPage;
