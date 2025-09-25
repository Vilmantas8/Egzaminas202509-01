// MAIN APP COMPONENT
// This is the main component that contains our entire React application
// Written in beginner-friendly style with clear comments

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Import our custom components (we'll create these)
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Equipment from './pages/Equipment';
import EquipmentDetails from './pages/EquipmentDetails';
import Reservations from './pages/Reservations';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ErrorBoundary from './components/ErrorBoundary';

// Import notification system
import { NotificationProvider } from './components/NotificationSystem';

// Import styles
import './App.css';
import './styles/responsive.css';
import './styles/responsive.css';

function App() {
  // STATE MANAGEMENT
  // These are our app-wide variables that can change
  
  const [user, setUser] = useState(null); // Currently logged in user
  const [loading, setLoading] = useState(true); // Is the app still loading?

  // FUNCTIONS

  // Function to check if user is logged in when app starts
  useEffect(() => {
    checkAuthStatus();
  }, []); // Empty array means this runs once when app starts

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Set token in axios headers for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Try to get user info
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      // If token is invalid, remove it
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  // Function to login user
  const loginUser = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Function to logout user
  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Component to protect admin routes
  const AdminRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (user.role !== 'admin') {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger">
            <h4>Prieiga uždrausta</h4>
            <p>Jums reikia administratoriaus teisių, kad pamatytumėte šį puslapį.</p>
          </div>
        </div>
      );
    }
    
    return children;
  };

  // Component to protect user routes (need to be logged in)
  const PrivateRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Kraunasi...</span>
        </div>
      </div>
    );
  }

  // MAIN APP RENDER
  return (
    <NotificationProvider>
      <Router>
        <div className="App">
          {/* Navigation bar - shows on every page */}
          <Navbar user={user} onLogout={logoutUser} />
          
          {/* Main content area */}
          <main className="container-fluid px-0">
            <Routes>
              {/* Public routes - anyone can see these */}
              <Route path="/" element={<Home />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/equipment/:id" element={<EquipmentDetails />} />
              
              {/* Authentication routes - only show if NOT logged in */}
              <Route 
                path="/login" 
                element={user ? <Navigate to="/" /> : <Login onLogin={loginUser} />} 
              />
              <Route 
                path="/register" 
                element={user ? <Navigate to="/" /> : <Register onLogin={loginUser} />} 
              />
              
              {/* Private routes - need to be logged in */}
              <Route 
                path="/reservations" 
                element={
                  <PrivateRoute>
                    <ErrorBoundary>
                      <Reservations user={user} />
                    </ErrorBoundary>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <Profile user={user} onUserUpdate={setUser} />
                  </PrivateRoute>
                } 
              />
              
              {/* Admin routes - need admin role */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              
              {/* 404 - page not found */}
              <Route 
                path="*" 
                element={
                  <div className="container mt-5">
                    <div className="text-center">
                      <h1 className="display-1">404</h1>
                      <h4>Puslapis nerastas</h4>
                      <p>Atsiprašome, bet tokio puslapio nėra.</p>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
