import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import './App.css';
import Footer from './components/Footer';

// Private route component to handle authentication
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/alerts" 
          element={
            <PrivateRoute>
              <Alerts />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
