import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const EditQuestionPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both the question and available tags
        const [questionRes, tagsRes] = await Promise.all([
          api.get(`/questions/${id}`),
          api.get('/tags')
        ]);
        
        const question = questionRes.data;
        
        // Authorization check
        if (question.author._id !== user._id && user.role !== 'admin') {
          toast.error('You are not authorized to edit this question');
          navigate(`/questions/${id}`);
          return;
        }

        setTitle(question.title);
        setBody(question.body);
        setSelectedTags(question.tags.map(t => t._id));
        setAvailableTags(tagsRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
        toast.error('Failed to load question data');
        navigate(`/questions/${id}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [id, user, navigate]);

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      if (selectedTags.length >= 5) {
        toast.error('You can only select up to 5 tags');
        return;
      }
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.put(`/questions/${id}`, {
        title,
        body,
        tags: selectedTags
      });
      toast.success('Question updated successfully!');
      navigate(`/questions/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update question');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Edit Question</h1>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ fontSize: '1.1rem' }}>Title</label>
            <input 
              type="text" 
              className="form-control" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ fontSize: '1.1rem' }}>Body</label>
            <textarea 
              className="form-control" 
              style={{ minHeight: '250px', resize: 'vertical' }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ fontSize: '1.1rem' }}>Tags</label>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Add up to 5 tags to describe what your question is about.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', padding: '1rem', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              {availableTags.map(tag => {
                const isSelected = selectedTags.includes(tag._id);
                return (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => toggleTag(tag._id)}
                    className="badge"
                    style={{
                      background: isSelected ? tag.color : `${tag.color}20`,
                      color: isSelected ? 'white' : tag.color,
                      border: `1px solid ${tag.color}`,
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditQuestionPage;
