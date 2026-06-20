import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiChevronUp, FiChevronDown, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { AuthContext } from '../../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AnswerCard = ({ answer, questionAuthorId, onUpdate }) => {
  const { user, isAdmin } = useContext(AuthContext);
  const [isVoting, setIsVoting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(answer.body);
  const [isSaving, setIsSaving] = useState(false);
  const [showAIFeedback, setShowAIFeedback] = useState(false);

  const handleVote = async (type) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      const res = await api.post(`/answers/${answer._id}/vote`, { type });
      onUpdate(answer._id, { ...answer, voteCount: res.data.voteCount, upvotes: res.data.upvotes, downvotes: res.data.downvotes });
    } catch (error) {
      toast.error('Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleAccept = async () => {
    try {
      await api.put(`/answers/${answer._id}/accept`);
      // Since this affects the question status and potentially other answers, 
      // trigger a full refetch via the parent component
      onUpdate('REFETCH'); 
    } catch (error) {
      toast.error('Failed to accept answer');
    }
  };

  const handleEditSave = async () => {
    if (!editBody.trim()) return;
    setIsSaving(true);
    try {
      const res = await api.put(`/answers/${answer._id}`, { body: editBody });
      onUpdate(answer._id, res.data);
      setIsEditing(false);
      toast.success('Answer updated successfully');
    } catch (error) {
      toast.error('Failed to update answer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    try {
      await api.delete(`/answers/${answer._id}`);
      onUpdate('REFETCH');
      toast.success('Answer deleted successfully');
    } catch (error) {
      toast.error('Failed to delete answer');
    }
  };

  const isQuestionAuthor = user?._id === questionAuthorId;
  const isAnswerAuthor = user?._id === answer.author?._id;

  return (
    <div className={`glass-card ${answer.isAccepted ? 'accepted-answer' : ''}`} style={{ 
      padding: '1rem 1.25rem', 
      marginBottom: '0.75rem', 
      border: answer.isAccepted ? '1px solid var(--accent-green)' : '1px solid var(--border-color)',
      position: 'relative'
    }}>
      
      {/* Author + Votes Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        {/* Author Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '24px', height: '24px', 
            borderRadius: '50%', 
            background: 'var(--accent-blue)', 
            color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: '0.7rem',
            flexShrink: 0
          }}>
            {answer.author?.avatar}
          </div>
          <Link to={`/profile/${answer.author?._id}`} style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
            {answer.author?.name}
          </Link>
          <span style={{ color: 'var(--accent-green-hover)', fontWeight: 600, fontSize: '0.75rem' }}>
            {answer.author?.reputation} <span style={{fontWeight: 400, color: 'var(--text-muted)'}}>rep</span>
          </span>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
            • {formatDistanceToNow(new Date(answer.createdAt))} ago
          </span>
          {answer.isAccepted && (
            <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 600 }}>
              <FiCheckCircle size={14} /> Accepted
            </span>
          )}
        </div>

        {/* Inline Votes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          <button onClick={() => handleVote('upvote')} style={{ color: answer.upvotes?.includes(user?._id) ? 'var(--accent-green)' : 'var(--text-secondary)', padding: '0.15rem', display: 'flex', alignItems: 'center' }}>
            <FiChevronUp size={20} />
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: answer.upvotes?.includes(user?._id) ? 'var(--accent-green)' : 'var(--text-secondary)', minWidth: '12px', textAlign: 'center' }}>
            {answer.upvotes?.length || 0}
          </span>
          <button onClick={() => handleVote('downvote')} style={{ color: answer.downvotes?.includes(user?._id) ? 'var(--accent-red)' : 'var(--text-secondary)', padding: '0.15rem', display: 'flex', alignItems: 'center' }}>
            <FiChevronDown size={20} />
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: answer.downvotes?.includes(user?._id) ? 'var(--accent-red)' : 'var(--text-secondary)', minWidth: '12px', textAlign: 'center' }}>
            {answer.downvotes?.length || 0}
          </span>
        </div>
      </div>

      {/* Answer Body */}
      {isEditing ? (
        <div style={{ paddingLeft: '2rem', marginBottom: '1rem', marginTop: '1rem' }}>
          <textarea 
            className="form-control" 
            style={{ minHeight: '150px', resize: 'vertical', width: '100%', marginBottom: '0.5rem' }}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
          ></textarea>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleEditSave} disabled={isSaving} className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => { setIsEditing(false); setEditBody(answer.body); }} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="markdown-body" style={{ marginBottom: 0, paddingLeft: '2rem' }}>
          <ReactMarkdown>{answer.body}</ReactMarkdown>
        </div>
      )}

      {/* AI Verification Banner */}
      {answer.aiVerification?.status && answer.aiVerification.status !== 'none' && answer.aiVerification.status !== 'pending' && (
        <div style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
          <button 
            onClick={() => setShowAIFeedback(!showAIFeedback)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              border: `1px solid ${answer.aiVerification.status === 'verified' ? 'var(--accent-green)' : 'var(--accent-amber)'}`,
              background: answer.aiVerification.status === 'verified' ? 'var(--accent-green-light)' : 'var(--accent-amber-light)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: showAIFeedback ? '0.5rem' : '0'
            }}
          >
            {answer.aiVerification.status === 'verified' ? <FiShield size={14} color="var(--accent-green)"/> : <FiAlertTriangle size={14} color="var(--accent-amber)" />}
            AI: {answer.aiVerification.status === 'verified' ? 'Verified' : 'Flagged'}
            {showAIFeedback ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>

          {showAIFeedback && (
            <div style={{ 
              borderRadius: 'var(--radius-sm)',
              background: answer.aiVerification.status === 'verified' ? 'var(--accent-green-light)' : 'var(--accent-amber-light)',
              borderLeft: `3px solid ${answer.aiVerification.status === 'verified' ? 'var(--accent-green)' : 'var(--accent-amber)'}`,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {answer.aiVerification.feedback}
              </div>
              
              {answer.aiVerification.suggestedCorrection && (
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>Recommended Answer / Correction:</strong>
                  <div className="markdown-body" style={{ margin: 0, padding: 0 }}>
                    <ReactMarkdown>{answer.aiVerification.suggestedCorrection}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingLeft: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {(isQuestionAuthor || isAdmin) && (
            <button onClick={handleAccept} className="text-secondary hover-text-green" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <FiCheckCircle size={14} /> {answer.isAccepted ? 'Unaccept' : 'Accept'}
            </button>
          )}
          {isAdmin && (
            <span className="badge badge-amber" style={{ cursor: 'pointer', fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>Admin</span>
          )}
        </div>
        
        {(isAnswerAuthor || isAdmin) && !isEditing && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setIsEditing(true)} className="text-secondary hover-text-blue" style={{ fontSize: '0.8rem' }}>Edit</button>
            <button onClick={handleDelete} className="text-secondary hover-text-red" style={{ fontSize: '0.8rem' }}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerCard;
