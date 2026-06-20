import { Link, useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiEye, FiCheckCircle } from 'react-icons/fi';
import Tag from '../common/Tag';
import { formatDistanceToNow } from 'date-fns';

const QuestionCard = ({ question }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="glass-card" 
      onClick={() => navigate(`/questions/${question._id}`)}
      style={{ padding: '1.5rem', marginBottom: '1rem', display: 'flex', gap: '1.5rem', cursor: 'pointer' }}
    >
      
      {/* Stats column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', minWidth: '80px', color: 'var(--text-secondary)' }}>
        <div style={{ color: question.voteCount > 0 ? 'var(--accent-text)' : 'inherit', fontWeight: question.voteCount > 0 ? 500 : 400 }}>
          {question.voteCount} votes
        </div>
        <div style={{ 
          color: question.acceptedAnswer ? 'var(--accent-green)' : (question.answersCount > 0 ? 'var(--text-primary)' : 'inherit'),
          border: question.acceptedAnswer ? '1px solid var(--accent-green)' : (question.answersCount > 0 ? '1px solid var(--border-color)' : 'none'),
          padding: question.answersCount > 0 ? '0.2rem 0.5rem' : 0,
          borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', gap: '0.25rem'
        }}>
          {question.acceptedAnswer && <FiCheckCircle />}
          {question.answersCount} answers
        </div>
        <div style={{ fontSize: '0.85rem' }}>
          {question.views} views
        </div>
      </div>

      {/* Content column */}
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {question.title}
        </h3>
        
        <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {question.body}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
            {question.tags?.map(tag => (
              <Tag key={tag._id} tag={tag} />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <div style={{ 
              width: '24px', height: '24px', 
              borderRadius: '50%', 
              background: 'var(--accent-green)', 
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 500, fontSize: '0.7rem'
            }}>
              {question.author?.avatar}
            </div>
            <Link 
              to={`/profile/${question.author?._id}`} 
              onClick={(e) => e.stopPropagation()}
              style={{ color: 'var(--accent-text)', fontWeight: 500 }}
            >
              {question.author?.name}
            </Link>
            <span className="text-muted">asked {formatDistanceToNow(new Date(question.createdAt))} ago</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default QuestionCard;
