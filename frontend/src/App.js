import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { lightTheme, darkTheme, GlobalStyles } from './theme';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SendReminder from './pages/SendReminder';
import Clients from './pages/Clients';
import History from './pages/History';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }
  
  return user ? <Navigate to="/" /> : children;
};

function AppContent() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to handle theme toggle
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Function to handle mobile menu body scroll
  const handleMenuToggle = (isOpen) => {
    if (isOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyles />
      <Router>
        <div className="app">
          {user && (
            <Navbar
              onMenuToggle={handleMenuToggle}
              toggleTheme={toggleTheme}
              isDarkMode={isDarkMode}
            />
          )}
          <div className="app-container">
            <Routes>
              {/* Public Route - Login */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/send-reminder"
                element={
                  <ProtectedRoute>
                    <SendReminder />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/clients"
                element={
                  <ProtectedRoute>
                    <Clients />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          {user && <Footer />}
        </div>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
