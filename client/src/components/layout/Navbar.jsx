import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiSearch, FiBell, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    if (query) {
      navigate(`/questions?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="glass-panel" style={{ 
      height: 'var(--navbar-height)', 
      position: 'sticky', 
      top: '1rem',
      margin: '0 1rem 1rem 1rem',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem',
      justifyContent: 'space-between',
      color: 'var(--text-primary)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent-blue)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#ffffff' }}>LT</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-blue-hover)' }}>LantroTech</span>
        </Link>

        <form onSubmit={handleSearch} style={{ position: 'relative', width: '300px' }}>
          <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            name="search"
            placeholder="Search questions..." 
            className="form-control"
            style={{ 
              paddingLeft: '35px', 
              borderRadius: 'var(--radius-full)', 
              background: 'var(--bg-card-hover)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)'
            }}
          />
        </form>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button style={{ color: 'var(--text-secondary)' }} title="Notifications">
          <FiBell size={20} />
        </button>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <div style={{ 
              width: '36px', height: '36px', 
              borderRadius: '50%', 
              background: 'var(--accent-green)', 
              color: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600,
              border: 'none'
            }}>
              {user?.avatar || 'U'}
            </div>
          </button>

          {showDropdown && (
            <div className="glass-panel" style={{ 
              position: 'absolute', 
              top: '100%', right: 0, 
              marginTop: '0.5rem',
              width: '200px',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              <div style={{ padding: '0.5rem', borderBottom: 'var(--glass-border)', marginBottom: '0.25rem' }}>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.department}</div>
              </div>
              
              <Link to={`/profile/${user?._id}`} className="dropdown-item" onClick={() => setShowDropdown(false)} style={dropdownItemStyle}>
                <FiUser /> Profile
              </Link>
              
              {isAdmin && (
                <Link to="/admin" className="dropdown-item" onClick={() => setShowDropdown(false)} style={dropdownItemStyle}>
                  <FiSettings /> Admin Dashboard
                </Link>
              )}
              
              <button onClick={() => { logout(); setShowDropdown(false); }} style={{...dropdownItemStyle, color: 'var(--accent-red)'}}>
                <FiLogOut /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-secondary)',
  transition: 'all var(--transition-fast)',
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '0.9rem'
};

export default Navbar;
