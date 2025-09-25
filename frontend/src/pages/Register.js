// REGISTER PAGE COMPONENT
// This page allows new users to create an account
// Simple registration form with validation - beginner friendly

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Register({ onLogin }) {
  // STATE - variables that can change
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // FUNCTIONS

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Validate form data
  const validateForm = () => {
    if (formData.name.length < 2) {
      setError('Vardas turi būti bent 2 simbolių ilgumo.');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Įveskite tinkamą el. pašto adresą.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Slaptažodis turi būti bent 6 simbolių ilgumo.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Slaptažodžiai nesutampa.');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
    
    // Validate form first
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send registration request to backend
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // If successful, automatically log the user in
      onLogin(response.data.user, response.data.token);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Show error message to user
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Registracijos klaida. Bandykite dar kartą.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="form-container">
              {/* Header */}
              <div className="text-center mb-4">
                <i className="bi bi-person-plus display-4 text-primary mb-3"></i>
                <h2 className="fw-bold">Registracija</h2>
                <p className="text-muted">Sukurkite naują paskyrą</p>
              </div>

              {/* Error message */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              {/* Success message */}
              {success && (
                <div className="alert alert-success" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit}>
                {/* Name field */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    <i className="bi bi-person me-2"></i>
                    Vardas
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Įveskite savo vardą"
                    required
                  />
                </div>

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
                <div className="mb-3">
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
                    placeholder="Įveskite slaptažodį (min. 6 simboliai)"
                    required
                  />
                </div>

                {/* Confirm Password field */}
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    <i className="bi bi-lock-fill me-2"></i>
                    Pakartokite slaptažodį
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Pakartokite slaptažodį"
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
                        Registruojamasi...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Registruotis
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Links */}
              <div className="text-center mt-4">
                <p className="text-muted">
                  Jau turite paskyrą?{' '}
                  <Link to="/login" className="text-decoration-none">
                    Prisijunkite čia
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;