import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiBriefcase, FiArrowRight } from 'react-icons/fi';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Engineering'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const { register, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await register(formData);
    if (success) {
      navigate('/');
    }
    setIsSubmitting(false);
  };

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  const departments = ['Engineering', 'HR', 'DevOps', 'Frontend', 'Backend', 'Design', 'QA', 'Management', 'Marketing', 'Support'];

  return (
    <div 
      onMouseMove={handleMouseMove}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}
    >
      
      {/* Background and Giant Text Watermark */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <h1 style={{ 
          fontSize: '32vw', 
          fontWeight: 900, 
          color: 'var(--accent-amber)', 
          opacity: 0.8,
          lineHeight: 0.75,
          userSelect: 'none',
          textAlign: 'center',
          margin: 0,
          letterSpacing: '-0.05em',
          transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)`,
          transition: 'transform 0.1s ease-out'
        }}>
          LANTRO<br />TECH
        </h1>
      </div>

      <div className="glass-panel" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', position: 'relative', overflow: 'hidden', zIndex: 10 }}>
        
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--accent-green)', opacity: '0.15', borderRadius: '50%', filter: 'blur(40px)' }}></div>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--accent-blue-hover)' }}>Create Account</h1>
          <p className="text-secondary">Join the Lantrotech Knowledge Base</p>
        </div>

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <FiUser style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                name="name"
                className="form-control" 
                style={{ paddingLeft: '35px' }}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                name="email"
                className="form-control" 
                style={{ paddingLeft: '35px' }}
                placeholder="john@lantrotech.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <div style={{ position: 'relative' }}>
              <FiBriefcase style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select 
                name="department"
                className="form-control" 
                style={{ paddingLeft: '35px', appearance: 'none' }}
                value={formData.department}
                onChange={handleChange}
                required
              >
                {departments.map(dept => (
                  <option key={dept} value={dept} style={{ background: 'var(--bg-card)' }}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                name="password"
                className="form-control" 
                style={{ paddingLeft: '35px' }}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Create Account'}
            {!isSubmitting && <FiArrowRight />}
          </button>
        </form>

        <p className="text-center text-muted" style={{ marginTop: '2rem', fontSize: '0.9rem', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-blue)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
