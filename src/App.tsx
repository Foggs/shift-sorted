import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Header } from './components/Header';
import { ResetPassword } from './pages/ResetPassword';
import { UpdatePassword } from './pages/UpdatePassword';
import { Profile } from './pages/Profile';
import { PostShift } from './pages/PostShift';
import { useAuth } from './lib/auth';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('shift-sorted-dark-mode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const { isAuthenticated, loading, profile } = useAuth();

  useEffect(() => {
    localStorage.setItem('shift-sorted-dark-mode', JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className={isDark ? 'dark' : ''}>
        <Header isDark={isDark} toggleDarkMode={() => setIsDark(!isDark)} isAuthenticated={isAuthenticated} />
        <Routes>
          <Route path="/" element={<Home isDark={isDark} />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login isDark={isDark} />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup isDark={isDark} />} />
          <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPassword isDark={isDark} />} />
          <Route path="/update-password" element={<UpdatePassword isDark={isDark} />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile isDark={isDark} />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                {profile.role ? <Dashboard isDark={isDark} /> : <Navigate to="/profile" replace />}
              </RequireAuth>
            }
          />
          <Route
            path="/post-shift"
            element={
              <RequireAuth>
                {profile.role === 'manager' ? <PostShift isDark={isDark} /> : <Navigate to="/dashboard" replace />}
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
