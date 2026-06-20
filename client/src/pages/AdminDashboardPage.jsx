import { useState, useEffect } from 'react';
import { FiUsers, FiHelpCircle, FiCheckSquare, FiMessageSquare } from 'react-icons/fi';
import api from '../services/api';
import Loader from '../components/common/Loader';
import StatsCard from '../components/admin/StatsCard';
import KnowledgeGapChart from '../components/admin/KnowledgeGapChart';
import FAQGenerator from '../components/admin/FAQGenerator';
import TrendingTopics from '../components/admin/TrendingTopics';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Admin Dashboard</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'knowledge-gaps', label: 'AI Knowledge Gaps' },
          { id: 'auto-faq', label: 'Auto-FAQ Generator' },
          { id: 'trending', label: 'Trending Topics' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              padding: '1rem 1.5rem', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-text)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--accent-text)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 500,
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div>
            {statsLoading ? (
              <Loader />
            ) : stats ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                  <StatsCard 
                    title="Total Questions" 
                    value={stats.totals.questions} 
                    icon={<FiHelpCircle />} 
                    color="var(--accent-blue)" 
                  />
                  <StatsCard 
                    title="Total Answers" 
                    value={stats.totals.answers} 
                    icon={<FiMessageSquare />} 
                    color="var(--accent-green)" 
                  />
                  <StatsCard 
                    title="Resolution Rate" 
                    value={`${stats.status.resolutionRate}%`} 
                    subtitle={`${stats.status.resolved} of ${stats.totals.questions} resolved`}
                    icon={<FiCheckSquare />} 
                    color="var(--accent-amber)" 
                  />
                  <StatsCard 
                    title="Active Users" 
                    value={stats.totals.users} 
                    icon={<FiUsers />} 
                    color="#8b5cf6" 
                  />
                </div>
                
                {/* Department Breakdown */}
                <h3 style={{ marginBottom: '1.5rem' }}>Questions by Department</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {stats.departments.map(dept => (
                    <div key={dept._id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500 }}>{dept._id}</span>
                      <span className="badge badge-blue">{dept.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-secondary">Failed to load overview stats.</p>
            )}
          </div>
        )}

        {activeTab === 'knowledge-gaps' && <KnowledgeGapChart />}
        
        {activeTab === 'auto-faq' && <FAQGenerator />}
        
        {activeTab === 'trending' && <TrendingTopics />}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
