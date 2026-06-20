const StatsCard = ({ title, value, subtitle, icon, color }) => {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: `4px solid ${color}` }}>
      <div style={{ 
        width: '50px', height: '50px', 
        borderRadius: 'var(--radius-md)', 
        background: `${color}20`, 
        color: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem'
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</h3>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>{value}</div>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
