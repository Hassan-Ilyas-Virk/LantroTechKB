import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiHelpCircle, FiHash, FiTrendingUp, FiStar } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import api from '../../services/api';

const Sidebar = () => {
  const location = useLocation();
  const [popularTags, setPopularTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get('/tags?sort=popular&limit=5');
        // slice is handled by backend or frontend, we'll just take top 5
        setPopularTags(res.data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching tags", error);
      }
    };
    fetchTags();
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: <FiHome /> },
    { name: 'Questions', path: '/questions', icon: <FiHelpCircle /> },
    { name: 'Tags', path: '/tags', icon: <FiHash /> },
  ];

  return (
    <aside className="glass-panel" style={{ 
      width: 'var(--sidebar-width)', 
      height: 'calc(100vh - var(--navbar-height) - 3rem)',
      position: 'sticky',
      top: 'calc(var(--navbar-height) + 2rem)',
      margin: '0 0 1rem 1rem',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      overflowY: 'auto'
    }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link 
              key={item.name} 
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                fontWeight: isActive ? 500 : 400,
                transition: 'all var(--transition-fast)'
              }}
            >
              <span style={{ color: isActive ? 'var(--accent-text)' : 'inherit' }}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>

      <div>
        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem', paddingLeft: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiTrendingUp /> Popular Tags</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {popularTags.map(tag => (
            <Link 
              key={tag._id} 
              to={`/questions?tag=${tag._id}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 1rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'all var(--transition-fast)'
              }}
              className="hover-bg-light"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tag.color || 'var(--accent-text)' }}></span>
                {tag.name}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tag.questionsCount}</span>
            </Link>
          ))}
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
