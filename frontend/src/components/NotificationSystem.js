// NOTIFICATION SYSTEM COMPONENTS
// Toast notification system for user feedback throughout the application
// Sprint 4 - T037 Notification System Implementation

import React, { createContext, useContext, useState, useCallback } from 'react';

// Notification Context
const NotificationContext = createContext();

// Notification Provider Component
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Add new notification
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info', // default type
      title: '',
      message: '',
      duration: 5000, // default 5 seconds
      autoClose: true,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after specified duration
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Shorthand methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      title: 'Sėkmė!',
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      title: 'Klaida!',
      message,
      duration: 8000, // Error messages stay longer
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      title: 'Įspėjimas!',
      message,
      duration: 6000,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      title: 'Informacija',
      message,
      ...options
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

// Hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// Individual Notification Component
function NotificationItem({ notification, onRemove }) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getNotificationConfig = () => {
    switch (notification.type) {
      case 'success':
        return {
          icon: 'bi-check-circle-fill',
          colorClass: 'notification-success',
          bgClass: 'alert-success'
        };
      case 'error':
        return {
          icon: 'bi-exclamation-triangle-fill',
          colorClass: 'notification-error',
          bgClass: 'alert-danger'
        };
      case 'warning':
        return {
          icon: 'bi-exclamation-circle-fill',
          colorClass: 'notification-warning',
          bgClass: 'alert-warning'
        };
      case 'info':
      default:
        return {
          icon: 'bi-info-circle-fill',
          colorClass: 'notification-info',
          bgClass: 'alert-info'
        };
    }
  };

  const config = getNotificationConfig();

  return (
    <div 
      className={`notification-item alert ${config.bgClass} ${isLeaving ? 'leaving' : ''}`}
      role="alert"
    >
      <div className="d-flex align-items-start">
        {/* Icon */}
        <div className="notification-icon me-3">
          <i className={`bi ${config.icon} fs-5`}></i>
        </div>

        {/* Content */}
        <div className="notification-content flex-grow-1">
          {notification.title && (
            <div className="notification-title fw-bold mb-1">
              {notification.title}
            </div>
          )}
          <div className="notification-message">
            {notification.message}
          </div>
          {notification.action && (
            <div className="notification-action mt-2">
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={notification.action.onClick}
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          className="btn-close ms-2"
          onClick={handleClose}
          aria-label="Uždaryti pranešimą"
        ></button>
      </div>

      {/* Progress bar for auto-close */}
      {notification.autoClose && (
        <div className="notification-progress">
          <div 
            className="notification-progress-bar"
            style={{ 
              animationDuration: `${notification.duration}ms`,
              animationPlayState: isLeaving ? 'paused' : 'running'
            }}
          ></div>
        </div>
      )}
    </div>
  );
}

// Notification Container Component
function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      <div className="notification-container">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>

      {/* Custom CSS */}
      <style>{`
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1050;
          max-width: 400px;
          width: 100%;
        }

        .notification-item {
          margin-bottom: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out;
          position: relative;
          overflow: hidden;
          border: none;
        }

        .notification-item.leaving {
          animation: slideOut 0.3s ease-in forwards;
        }

        .notification-icon {
          flex-shrink: 0;
        }

        .notification-title {
          font-size: 0.9rem;
        }

        .notification-message {
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .notification-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.3);
        }

        .notification-progress-bar {
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          animation: progressBar linear forwards;
          transform-origin: left;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes progressBar {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }

        /* Mobile responsive */
        @media (max-width: 576px) {
          .notification-container {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }

          .notification-item {
            margin-bottom: 10px;
          }

          .notification-title {
            font-size: 0.85rem;
          }

          .notification-message {
            font-size: 0.8rem;
          }
        }

        /* Custom alert styles for better contrast */
        .notification-item.alert-success {
          background-color: #d1e7dd;
          border-color: #badbcc;
          color: #0f5132;
        }

        .notification-item.alert-error,
        .notification-item.alert-danger {
          background-color: #f8d7da;
          border-color: #f5c2c7;
          color: #842029;
        }

        .notification-item.alert-warning {
          background-color: #fff3cd;
          border-color: #ffecb5;
          color: #664d03;
        }

        .notification-item.alert-info {
          background-color: #d1ecf1;
          border-color: #b8daff;
          color: #055160;
        }
      `}</style>
    </>
  );
}

// Notification Hook with predefined messages for common actions
export function useAppNotifications() {
  const notifications = useNotifications();

  return {
    ...notifications,
    
    // Equipment actions
    equipmentCreated: () => notifications.showSuccess('Įranga sėkmingai sukurta!'),
    equipmentUpdated: () => notifications.showSuccess('Įrangos duomenys atnaujinti!'),
    equipmentDeleted: () => notifications.showSuccess('Įranga sėkmingai ištrinta!'),
    equipmentError: (message) => notifications.showError(`Įrangos klaida: ${message}`),

    // Reservation actions
    reservationCreated: () => notifications.showSuccess('Rezervacija sėkmingai sukurta!'),
    reservationUpdated: () => notifications.showSuccess('Rezervacija atnaujinta!'),
    reservationCancelled: () => notifications.showInfo('Rezervacija atšaukta'),
    reservationConfirmed: () => notifications.showSuccess('Rezervacija patvirtinta!'),
    reservationRejected: () => notifications.showWarning('Rezervacija atmesta'),
    reservationError: (message) => notifications.showError(`Rezervacijos klaida: ${message}`),

    // Authentication actions
    loginSuccess: () => notifications.showSuccess('Sėkmingai prisijungėte!'),
    loginError: () => notifications.showError('Prisijungimo klaida. Patikrinkite duomenis.'),
    logoutSuccess: () => notifications.showInfo('Sėkmingai atsijungėte'),
    registerSuccess: () => notifications.showSuccess('Paskyra sėkmingai sukurta!'),
    registerError: (message) => notifications.showError(`Registracijos klaida: ${message}`),

    // General actions
    saveSuccess: () => notifications.showSuccess('Duomenys sėkmingai išsaugoti!'),
    saveError: () => notifications.showError('Nepavyko išsaugoti duomenų'),
    loadError: () => notifications.showError('Nepavyko užkrauti duomenų'),
    networkError: () => notifications.showError('Tinklo klaida. Bandykite vėliau.'),
    accessDenied: () => notifications.showWarning('Neturite teisių šiai operacijai'),
    
    // Validation messages
    validationError: (message) => notifications.showWarning(`Duomenų tikrinimo klaida: ${message}`),
    requiredFields: () => notifications.showWarning('Užpildykite visus privalomas laukus'),

    // File operations
    fileUploaded: () => notifications.showSuccess('Failas sėkmingai įkeltas!'),
    fileUploadError: () => notifications.showError('Nepavyko įkelti failo'),

    // Custom notification with action button
    showWithAction: (message, actionLabel, actionCallback) => {
      return notifications.addNotification({
        type: 'info',
        message,
        action: {
          label: actionLabel,
          onClick: actionCallback
        },
        duration: 10000, // Longer duration for actionable notifications
        autoClose: false // Don't auto-close actionable notifications
      });
    }
  };
}

export default NotificationProvider;