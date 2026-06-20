import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Pages will be imported here later
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import QuestionsPage from './pages/QuestionsPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import AskQuestionPage from './pages/AskQuestionPage';
import EditQuestionPage from './pages/EditQuestionPage';
import TagsPage from './pages/TagsPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
// Placeholder components until built
import AdminDashboardPage from './pages/AdminDashboardPage';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);
  
  if (loading) return <div className="page-container">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" />;
  
  return children;
};

function App() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return null; // App handles its own initial loading if needed

  return (
    <div className="app-container">
      {isAuthenticated && <Navbar />}
      <div style={{ display: 'flex', flex: 1 }}>
        {isAuthenticated && <Sidebar />}
        <main className="main-content">
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          
          <Route path="/questions" element={
            <ProtectedRoute>
              <QuestionsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/questions/:id" element={
            <ProtectedRoute>
              <QuestionDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="/ask" element={
            <ProtectedRoute>
              <AskQuestionPage />
            </ProtectedRoute>
          } />

          <Route path="/questions/:id/edit" element={
            <ProtectedRoute>
              <EditQuestionPage />
            </ProtectedRoute>
          } />
          
          <Route path="/tags" element={
            <ProtectedRoute>
              <TagsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile/:id" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
        </Routes>
        </main>
      </div>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
    </div>
  );
}

export default App;
