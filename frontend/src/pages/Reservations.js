// ENHANCED RESERVATIONS PAGE WITH EDIT FUNCTIONALITY
// Users can view, edit, and cancel their reservations
// Sprint 4 - T034 Edit/Cancel Reservations (Edit functionality added)

/**
 * @typedef {Object} Equipment
 * @property {string} [_id] - Equipment ID
 * @property {string} [name] - Equipment name
 * @property {string} [category] - Equipment category
 * @property {number} [dailyRate] - Daily rental rate
 */

/**
 * @typedef {Object} User
 * @property {string} [_id] - User ID
 * @property {string} [name] - User name
 * @property {string} [email] - User email
 */

/**
 * @typedef {Object} Reservation
 * @property {string} _id - Reservation ID
 * @property {Equipment} equipment - Equipment object
 * @property {User} user - User object
 * @property {string} status - Reservation status (pending, confirmed, rejected, active, completed, cancelled)
 * @property {number} totalCost - Total cost of reservation
 * @property {string} notes - Additional notes
 * @property {string} startDate - Start date (ISO string)
 * @property {string} endDate - End date (ISO string)
 * @property {string} createdAt - Creation timestamp (ISO string)
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import EditReservationModal from '../components/EditReservationModal';
import { useAppNotifications } from '../components/NotificationSystem';

function Reservations({ user }) {
  const location = useLocation();
  const notifications = useAppNotifications();
  
  // STATE
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  
  // Edit reservation state
  const [editingReservation, setEditingReservation] = useState(null);
  const [editForm, setEditForm] = useState({
    startDate: '',
    endDate: '',
    notes: ''
  });

  // FUNCTIONS

  // Load reservations when component mounts
  useEffect(() => {
    loadReservations();
    
    // Check if there's a success message from navigation
    if (location.state && location.state.message) {
      notifications.showSuccess(location.state.message);
    }
  }, [location.state]);

  // Helper to normalize one reservation into a safe shape
  const normalizeReservation = (r = {}) => {
    const equipment = r.equipment ?? {
      _id: r.equipmentId ?? null,
      name: 'Nežinomas įrenginys',
      category: '—',
      dailyRate: 0
    };

    const userObj = r.user ?? {
      _id: r.userId ?? null,
      name: '—',
      email: '—',
    };

    return {
      _id: r._id ?? '',
      equipment,
      user: userObj,
      status: r.status ?? 'pending',
      totalCost: r.totalCost ?? 0,
      notes: r.notes ?? '',
      startDate: r.startDate ?? '',
      endDate: r.endDate ?? '',
      createdAt: r.createdAt ?? new Date().toISOString(),
    };
  };

  // Function to load reservations from backend
  const loadReservations = async () => {
    try {
      const response = await axios.get('/api/reservations');
      const safe = Array.isArray(response.data)
        ? response.data.map(normalizeReservation)
        : [];
      setReservations(safe);
    } catch (error) {
      console.error('Error loading reservations:', error);
      notifications.loadError();
    } finally {
      setLoading(false);
    }
  };

  // Function to start editing reservation
  const startEditingReservation = (reservation) => {
    if (!reservation) return;

    const startIso = reservation.startDate ?? '';
    const endIso = reservation.endDate ?? '';

    const safeStart = startIso.includes('T') ? startIso.split('T')[0] : startIso;
    const safeEnd = endIso.includes('T') ? endIso.split('T')[0] : endIso;

    setEditingReservation({
      ...reservation,
      equipment: reservation.equipment ?? { name: 'Nežinomas įrenginys', dailyRate: 0 },
    });

    setEditForm({
      startDate: safeStart,
      endDate: safeEnd,
      notes: reservation.notes ?? ''
    });
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingReservation(null);
    setEditForm({
      startDate: '',
      endDate: '',
      notes: ''
    });
  };

  // Function to save edited reservation
  const saveEditedReservation = async () => {
    if (!editForm.startDate || !editForm.endDate) {
      notifications.validationError('Įveskite visas būtinas datas.');
      return;
    }

    if (new Date(editForm.startDate) >= new Date(editForm.endDate)) {
      notifications.validationError('Pabaigos data turi būti vėlesnė už pradžios datą.');
      return;
    }

    if (new Date(editForm.startDate) < new Date().setHours(0, 0, 0, 0)) {
      notifications.validationError('Pradžios data negali būti praeityje.');
      return;
    }

    setActionLoading({ [editingReservation._id]: 'saving' });
    
    try {
      await axios.put(`/api/reservations/${editingReservation._id}`, {
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        notes: editForm.notes.trim()
      });

      notifications.reservationUpdated();
      cancelEditing();
      loadReservations(); // Reload the list
    } catch (error) {
      console.error('Update reservation error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        notifications.reservationError(error.response.data.error);
      } else {
        notifications.reservationError('Nepavyko atnaujinti rezervacijos.');
      }
    } finally {
      setActionLoading({});
    }
  };

  // Function to cancel reservation
  const cancelReservation = async (reservationId) => {
    if (!window.confirm('Ar tikrai norite atšaukti šią rezervaciją?')) {
      return;
    }

    setActionLoading({ [reservationId]: 'cancelling' });
    
    try {
      await axios.delete(`/api/reservations/${reservationId}`);
      notifications.reservationCancelled();
      loadReservations(); // Reload the list
    } catch (error) {
      console.error('Cancel reservation error:', error);
      notifications.reservationError('Nepavyko atšaukti rezervacijos.');
    } finally {
      setActionLoading({});
    }
  };

  // Function to update reservation status (admin only)
  const updateReservationStatus = async (reservationId, newStatus) => {
    setActionLoading({ [reservationId]: 'updating' });
    
    try {
      await axios.put(`/api/reservations/${reservationId}`, {
        status: newStatus
      });
      
      const statusMessages = {
        'confirmed': () => notifications.reservationConfirmed(),
        'rejected': () => notifications.reservationRejected(),
        'active': () => notifications.showSuccess('Rezervacija pažymėta kaip aktyvi!'),
        'completed': () => notifications.showSuccess('Rezervacija užbaigta!')
      };
      
      if (statusMessages[newStatus]) {
        statusMessages[newStatus]();
      }
      
      loadReservations(); // Reload the list
    } catch (error) {
      console.error('Update status error:', error);
      notifications.reservationError('Nepavyko pakeisti rezervacijos statuso.');
    } finally {
      setActionLoading({});
    }
  };

  // Helper function to get status label in Lithuanian
  const getStatusLabel = (status) => {
    const statusLabels = {
      'pending': 'Laukiama patvirtinimo',
      'confirmed': 'Patvirtinta',
      'rejected': 'Atmesta',
      'active': 'Vykdoma',
      'completed': 'Užbaigta',
      'cancelled': 'Atšaukta'
    };
    return statusLabels[status] || status;
  };

  // Helper function to get status badge class
  const getStatusBadgeClass = (status) => {
    const classes = {
      'pending': 'bg-warning text-dark',
      'confirmed': 'bg-success',
      'rejected': 'bg-danger',
      'active': 'bg-primary',
      'completed': 'bg-secondary',
      'cancelled': 'bg-dark'
    };
    return classes[status] || 'bg-secondary';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format price
  const formatPrice = (price) => {
    return `${price}€`;
  };

  // Helper function to calculate days
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // Include end date
  };

  // Check if reservation can be edited
  const canEditReservation = (reservation) => {
    return user && user.role !== 'admin' && 
           ['pending', 'confirmed'].includes(reservation.status) &&
           new Date(reservation.startDate) > new Date();
  };

  // Calculate total cost for edit form
  const calculateEditFormCost = () => {
    if (!editForm.startDate || !editForm.endDate || !editingReservation) {
      return editingReservation ? editingReservation.totalCost : 0;
    }
    
    const days = calculateDays(editForm.startDate, editForm.endDate);
    const dailyRate = editingReservation?.equipment?.dailyRate ?? 0;
    return days * dailyRate;
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Kraunasi...</span>
          </div>
          <p className="mt-3">Kraunamos rezervacijos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reservations-page py-5">
      <div className="container">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center">
              <i className="bi bi-calendar-check display-4 text-primary me-3"></i>
              <div>
                <h1 className="fw-bold mb-1">
                  {user && user.role === 'admin' ? 'Visos rezervacijos' : 'Mano rezervacijos'}
                </h1>
                <p className="text-muted mb-0">
                  {user && user.role === 'admin' 
                    ? 'Valdykite visas sistemos rezervacijas'
                    : 'Peržiūrėkite ir valdykite savo rezervacijas'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x display-1 text-muted mb-3"></i>
            <h4>Rezervacijų nėra</h4>
            <p className="text-muted">
              {user && user.role === 'admin' 
                ? 'Sistemoje dar nėra jokių rezervacijų.'
                : 'Jūs dar neturite jokių rezervacijų.'
              }
            </p>
          </div>
        ) : (
          <div className="row">
            {reservations.map(reservation => (
              <div key={reservation._id} className="col-md-6 col-xl-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    {/* Status Badge */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className={`badge ${getStatusBadgeClass(reservation.status)} fs-6`}>
                        {getStatusLabel(reservation.status)}
                      </span>
                      <small className="text-muted">
                        #{reservation._id.slice(-6).toUpperCase()}
                      </small>
                    </div>

                    {/* Equipment Info */}
                    <div className="mb-3">
                      <h5 className="card-title fw-bold mb-1">
                        {reservation.equipment?.name ?? 'Nežinomas įrenginys'}
                      </h5>
                      <small className="text-muted">
                        <i className="bi bi-tag me-1"></i>
                        {reservation.equipment?.category ?? '—'}
                      </small>
                    </div>

                    {/* User Info (for admin) */}
                    {user && user.role === 'admin' && (
                      <div className="mb-3">
                        <small className="text-muted">
                          <i className="bi bi-person me-1"></i>
                          {reservation.user?.name ?? '—'} ({reservation.user?.email ?? '—'})
                        </small>
                      </div>
                    )}

                    {/* Date Range */}
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-1">
                        <i className="bi bi-calendar me-2 text-primary"></i>
                        <strong>Periodas:</strong>
                      </div>
                      <div className="ms-4">
                        <div>{formatDate(reservation.startDate)}</div>
                        <div className="text-muted">iki</div>
                        <div>{formatDate(reservation.endDate)}</div>
                        <small className="text-muted">
                          ({calculateDays(reservation.startDate, reservation.endDate)} d.)
                        </small>
                      </div>
                    </div>

                    {/* Total Cost */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span><strong>Suma:</strong></span>
                        <span className="fw-bold text-primary">
                          {formatPrice(reservation.totalCost)}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {reservation.notes && (
                      <div className="mb-3">
                        <small className="text-muted">
                          <i className="bi bi-chat-text me-1"></i>
                          <strong>Pastabos:</strong> {reservation.notes}
                        </small>
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="mb-3">
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        Sukurta: {formatDate(reservation.createdAt)}
                      </small>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto">
                      {user && user.role === 'admin' ? (
                        /* Admin Controls */
                        <div className="d-grid gap-2">
                          {reservation.status === 'pending' && (
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => updateReservationStatus(reservation._id, 'confirmed')}
                                disabled={actionLoading[reservation._id]}
                              >
                                {actionLoading[reservation._id] === 'updating' ? (
                                  <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Kraunasi...</span>
                                  </div>
                                ) : (
                                  <>
                                    <i className="bi bi-check me-1"></i>
                                    Patvirtinti
                                  </>
                                )}
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => updateReservationStatus(reservation._id, 'rejected')}
                                disabled={actionLoading[reservation._id]}
                              >
                                <i className="bi bi-x me-1"></i>
                                Atmesti
                              </button>
                            </div>
                          )}
                          
                          {reservation.status === 'confirmed' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => updateReservationStatus(reservation._id, 'active')}
                              disabled={actionLoading[reservation._id]}
                            >
                              <i className="bi bi-play me-1"></i>
                              Pradėti
                            </button>
                          )}
                          
                          {reservation.status === 'active' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => updateReservationStatus(reservation._id, 'completed')}
                              disabled={actionLoading[reservation._id]}
                            >
                              <i className="bi bi-check-circle me-1"></i>
                              Užbaigti
                            </button>
                          )}
                        </div>
                      ) : (
                        /* User Controls */
                        <div className="d-grid gap-2">
                          {canEditReservation(reservation) && (
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => startEditingReservation(reservation)}
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Redaguoti
                            </button>
                          )}
                          
                          {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => cancelReservation(reservation._id)}
                              disabled={actionLoading[reservation._id]}
                            >
                              {actionLoading[reservation._id] === 'cancelling' ? (
                                <>
                                  <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Kraunasi...</span>
                                  </div>
                                  Atšaukiama...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-x-circle me-1"></i>
                                  Atšaukti rezervaciją
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats for Admin */}
        {user && user.role === 'admin' && reservations.length > 0 && (
          <div className="row mt-5">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Rezervacijų statistika
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-sm-6 col-md-2 mb-3">
                      <div className="h4 text-warning mb-0">
                        {reservations.filter(r => r.status === 'pending').length}
                      </div>
                      <small className="text-muted">Laukia</small>
                    </div>
                    <div className="col-sm-6 col-md-2 mb-3">
                      <div className="h4 text-success mb-0">
                        {reservations.filter(r => r.status === 'confirmed').length}
                      </div>
                      <small className="text-muted">Patvirtinta</small>
                    </div>
                    <div className="col-sm-6 col-md-2 mb-3">
                      <div className="h4 text-primary mb-0">
                        {reservations.filter(r => r.status === 'active').length}
                      </div>
                      <small className="text-muted">Aktyvus</small>
                    </div>
                    <div className="col-sm-6 col-md-2 mb-3">
                      <div className="h4 text-secondary mb-0">
                        {reservations.filter(r => r.status === 'completed').length}
                      </div>
                      <small className="text-muted">Užbaigta</small>
                    </div>
                    <div className="col-sm-6 col-md-2 mb-3">
                      <div className="h4 text-danger mb-0">
                        {reservations.filter(r => r.status === 'rejected').length}
                      </div>
                      <small className="text-muted">Atmesta</small>
                    </div>
                    <div className="col-sm-6 col-md-2 mb-3">
                      <div className="h4 text-dark mb-0">
                        {reservations.filter(r => r.status === 'cancelled').length}
                      </div>
                      <small className="text-muted">Atšaukta</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Reservation Modal */}
        {editingReservation && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-pencil-square me-2"></i>
                    Redaguoti rezervaciją
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={cancelEditing}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <h6>Įranga:</h6>
                    <p className="text-muted">{editingReservation?.equipment?.name ?? 'Nežinomas įrenginys'}</p>
                  </div>

                  <div className="row mb-3">
                    <div className="col-6">
                      <label htmlFor="editStartDate" className="form-label">
                        Pradžios data *
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="editStartDate"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="editEndDate" className="form-label">
                        Pabaigos data *
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="editEndDate"
                        value={editForm.endDate}
                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                        min={editForm.startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Updated cost preview */}
                  {editForm.startDate && editForm.endDate && (
                    <div className="mb-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Dienų skaičius:</span>
                            <strong>{calculateDays(editForm.startDate, editForm.endDate)}</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span>Kaina per dieną:</span>
                            <strong>{formatPrice(editingReservation?.equipment?.dailyRate ?? 0)}</strong>
                          </div>
                          <hr className="my-2" />
                          <div className="d-flex justify-content-between">
                            <strong>Nauja suma:</strong>
                            <strong className="text-primary">{formatPrice(calculateEditFormCost())}</strong>
                          </div>
                          {calculateEditFormCost() !== editingReservation.totalCost && (
                            <small className="text-muted">
                              (Buvo: {formatPrice(editingReservation.totalCost)})
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="editNotes" className="form-label">
                      Pastabos
                    </label>
                    <textarea
                      className="form-control"
                      id="editNotes"
                      rows="3"
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Papildomos pastabos..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={cancelEditing}
                  >
                    Atšaukti
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={saveEditedReservation}
                    disabled={actionLoading[editingReservation._id]}
                  >
                    {actionLoading[editingReservation._id] === 'saving' ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Kraunasi...</span>
                        </div>
                        Išsaugoma...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Išsaugoti pakeitimus
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reservations;