// LOGIN PAGE COMPONENT
// This page allows users to log into their account
// Simple form with validation - beginner friendly

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Login({ onLogin }) {
  // STATE - variables that can change
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // FUNCTIONS

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
    setLoading(true);
    setError('');

    try {
      // Send login request to backend
      const response = await axios.post('/api/auth/login', formData);
      
      // If successful, call the onLogin function from App.js
      onLogin(response.data.user, response.data.token);
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Show error message to user
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Prisijungimo klaida. Bandykite dar kartą.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="form-container">
              {/* Header */}
              <div className="text-center mb-4">
                <i className="bi bi-box-arrow-in-right display-4 text-primary mb-3"></i>
                <h2 className="fw-bold">Prisijungimas</h2>
                <p className="text-muted">Įveskite savo duomenis prisijungimui</p>
              </div>

              {/* Error message */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                {/* Email field */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="bi bi-envelope me-2"></i>
                    El. paštas
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Įveskite el. pašto adresą"
                    required
                  />
                </div>

                {/* Password field */}
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    <i className="bi bi-lock me-2"></i>
                    Slaptažodis
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Įveskite slaptažodį"
                    required
                  />
                </div>

                {/* Submit button */}
                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Kraunasi...</span>
                        </div>
                        Prisijungiama...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Prisijungti
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Links */}
              <div className="text-center mt-4">
                <p className="text-muted">
                  Neturite paskyros?{' '}
                  <Link to="/register" className="text-decoration-none">
                    Registruokitės čia
                  </Link>
                </p>
              </div>

              {/* Demo credentials info */}
              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="fw-bold text-muted mb-2">
                  <i className="bi bi-info-circle me-2"></i>
                  Demo duomenys testavimui:
                </h6>
                <small className="text-muted">
                  <strong>Administratorius:</strong> admin@example.com / admin123<br/>
                  <strong>Vartotojas:</strong> john@example.com / user123
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
