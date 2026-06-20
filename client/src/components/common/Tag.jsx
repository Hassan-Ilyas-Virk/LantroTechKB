import { Link } from 'react-router-dom';

const Tag = ({ tag, clickable = true }) => {
  if (!tag) return null;

  const content = (
    <span 
      className="badge" 
      style={{ 
        background: `${tag.color || '#3b82f6'}20`, 
        color: tag.color || '#3b82f6',
        border: `1px solid ${tag.color || '#3b82f6'}40`,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all var(--transition-fast)'
      }}
    >
      #{tag.name}
    </span>
  );

  if (clickable) {
    return <Link to={`/questions?tag=${tag._id}`} style={{ textDecoration: 'none' }}>{content}</Link>;
  }

  return content;
};

export default Tag;
