// NAVIGATION BAR COMPONENT
// This shows the navigation menu at the top of every page
// Beginner-friendly React component with clear explanations

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const location = useLocation(); // Get current page location

  // Function to check if a nav link is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top">
      <div className="container">
        {/* Brand/Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-truck me-2 fs-4"></i>
          <span>TechRent</span>
        </Link>

        {/* Mobile hamburger menu button */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {/* Home link */}
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">
                <i className="bi bi-house me-1"></i>
                Pagrindinis
              </Link>
            </li>

            {/* Equipment link */}
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/equipment')}`} to="/equipment">
                <i className="bi bi-tools me-1"></i>
                Įranga
              </Link>
            </li>

            {/* Show these links only if user is logged in */}
            {user && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/reservations')}`} to="/reservations">
                    <i className="bi bi-calendar-check me-1"></i>
                    Mano rezervacijos
                  </Link>
                </li>

                {/* Show admin link only if user is admin */}
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link className={`nav-link ${isActive('/admin')}`} to="/admin">
                      <i className="bi bi-shield-check me-1"></i>
                      Administracija
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>

          {/* Right side of navbar */}
          <ul className="navbar-nav">
            {user ? (
              // Show if user is logged in
              <>
                {/* User name and profile link */}
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle d-flex align-items-center" 
                    href="#" 
                    role="button" 
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user.name}
                    {user.role === 'admin' && (
                      <span className="badge bg-primary ms-2">Admin</span>
                    )}
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i>
                        Profilis
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={onLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Atsijungti
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              // Show if user is NOT logged in
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/login')}`} to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Prisijungti
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/register')}`} to="/register">
                    <i className="bi bi-person-plus me-1"></i>
                    Registruotis
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
