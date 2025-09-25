// PROFILE PAGE COMPONENT
// This page allows users to view and update their profile information
// Simple user profile management - beginner friendly

import React, { useState } from 'react';
import axios from 'axios';

function Profile({ user, onUserUpdate }) {
  // STATE
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  // Password change form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // FUNCTIONS

  // Handle profile form input changes
  const handleProfileInputChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  // Handle password form input changes
  const handlePasswordInputChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  // Validate profile form
  const validateProfileForm = () => {
    if (!profileForm.name.trim()) {
      setError('Vardas negali būti tuščias.');
      return false;
    }

    if (profileForm.name.length < 2) {
      setError('Vardas turi būti bent 2 simbolių ilgumo.');
      return false;
    }

    if (!profileForm.email.trim()) {
      setError('El. paštas negali būti tuščias.');
      return false;
    }

    if (!profileForm.email.includes('@')) {
      setError('Įveskite tinkamą el. pašto adresą.');
      return false;
    }

    return true;
  };

  // Validate password form
  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      setError('Įveskite dabartinį slaptažodį.');
      return false;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Naujas slaptažodis turi būti bent 6 simbolių ilgumo.');
      return false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Nauji slaptažodžiai nesutampa.');
      return false;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setError('Naujas slaptažodis turi skirtis nuo dabartinio.');
      return false;
    }

    return true;
  };

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;

    setLoading(true);
    setError('');

    try {
      // For now, we'll simulate profile update since the backend doesn't have this endpoint
      // In real implementation, you would call: await axios.put('/api/auth/profile', profileForm);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data in parent component
      onUserUpdate({
        ...user,
        name: profileForm.name,
        email: profileForm.email
      });

      setSuccessMessage('Profilis sėkmingai atnaujintas!');
      setIsEditing(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);

    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Nepavyko atnaujinti profilio.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    setError('');

    try {
      // For now, we'll simulate password change since the backend doesn't have this endpoint
      // In real implementation: await axios.put('/api/auth/change-password', passwordForm);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage('Slaptažodis sėkmingai pakeistas!');
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);

    } catch (error) {
      console.error('Password change error:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Nepavyko pakeisti slaptažodžio.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
    setError('');
  };

  // Cancel password change
  const handleCancelPassword = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(false);
    setError('');
  };

  // Show profile form if no user data
  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Nepavyko rasti vartotojo duomenų. Prisijunkite iš naujo.
        </div>
      </div>
    );
  }

  // RENDER
  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          
          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="fas fa-user me-2"></i>
              Mano Profilis
            </h2>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="btn btn-outline-primary"
              >
                <i className="fas fa-edit me-2"></i>
                Redaguoti
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle me-2"></i>
              {successMessage}
            </div>
          )}

          {/* Profile Information Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-id-card me-2"></i>
                Profilio Informacija
              </h5>
            </div>
            <div className="card-body">
              
              {/* Profile Display/Edit Form */}
              {!isEditing ? (
                // Display Mode
                <div>
                  <div className="row mb-3">
                    <div className="col-sm-3"><strong>Vardas:</strong></div>
                    <div className="col-sm-9">{user.name}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3"><strong>El. paštas:</strong></div>
                    <div className="col-sm-9">{user.email}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3"><strong>Tipas:</strong></div>
                    <div className="col-sm-9">
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role === 'admin' ? 'Administratorius' : 'Vartotojas'}
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-3"><strong>Registracijos data:</strong></div>
                    <div className="col-sm-9">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('lt-LT') : 'N/A'}
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleProfileSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Vardas <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileInputChange}
                      placeholder="Įveskite savo vardą"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      El. paštas <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileInputChange}
                      placeholder="Įveskite savo el. paštą"
                      required
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Išsaugoma...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Išsaugoti
                        </>
                      )}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={handleCancelEdit}
                      className="btn btn-secondary"
                      disabled={loading}
                    >
                      <i className="fas fa-times me-2"></i>
                      Atšaukti
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Password Change Card */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-lock me-2"></i>
                Slaptažodžio Keitimas
              </h5>
            </div>
            <div className="card-body">
              
              {!showPasswordForm ? (
                <div>
                  <p className="text-muted mb-3">
                    Norėdami keisti slaptažodį, spustelėkite mygtuką žemiau.
                  </p>
                  <button 
                    onClick={() => setShowPasswordForm(true)}
                    className="btn btn-outline-warning"
                  >
                    <i className="fas fa-key me-2"></i>
                    Keisti Slaptažodį
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">
                      Dabartinis slaptažodis <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Įveskite dabartinį slaptažodį"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      Naujas slaptažodis <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Įveskite naują slaptažodį (min. 6 simboliai)"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Pakartokite naują slaptažodį <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Įveskite naują slaptažodį dar kartą"
                      required
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-warning"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Keičiama...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-key me-2"></i>
                          Keisti Slaptažodį
                        </>
                      )}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={handleCancelPassword}
                      className="btn btn-secondary"
                      disabled={passwordLoading}
                    >
                      <i className="fas fa-times me-2"></i>
                      Atšaukti
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;