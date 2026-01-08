import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/FirebaseConfig';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import Login from './Login';
import Admin from './Admin';
import AdminTask from './AdminTask';
import AdminNews from './AdminNews';
import Profile from './Profile';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, user, loading }) => {
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Login Route Logic: Redirect to /admintask if already logged in
const LoginRoute = ({ user, loading }) => {
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }
  if (user) {
    return <Navigate to="/admintask" replace />;
  }
  return <Login />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginRoute user={user} loading={loading} />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admintask"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <AdminTask />
            </ProtectedRoute>
          }
        />

        <Route
          path="/adminNews"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <AdminNews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
