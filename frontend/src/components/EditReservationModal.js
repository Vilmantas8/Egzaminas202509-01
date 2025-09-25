// EDIT RESERVATION MODAL COMPONENT
// Modal component for editing existing reservations
// Sprint 4 - T034 Edit/Cancel Reservations Implementation

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AvailabilityCalendar from './AvailabilityCalendar';
import { useAppNotifications } from './NotificationSystem';

function EditReservationModal({ reservation, onClose, onReservationUpdated }) {
  const notifications = useAppNotifications();
  
  // STATE
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Initialize form with current reservation data
  useEffect(() => {
    if (reservation) {
      setSelectedDates({
        startDate: reservation.startDate.split('T')[0],
        endDate: reservation.endDate.split('T')[0]
      });
      setNotes(reservation.notes || '');
    }
  }, [reservation]);

  // FUNCTIONS

  // Handle date selection from calendar
  const handleDateSelect = (dates) => {
    setSelectedDates(dates);
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    if (!selectedDates.startDate || !selectedDates.endDate || !reservation) {
      return reservation?.totalCost || 0;
    }
    
    const startDate = new Date(selectedDates.startDate);
    const endDate = new Date(selectedDates.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    return days * reservation.equipment.dailyRate;
  };

  // Check if form has changes
  const hasChanges = () => {
    const originalStartDate = reservation.startDate.split('T')[0];
    const originalEndDate = reservation.endDate.split('T')[0];
    const originalNotes = reservation.notes || '';
    
    return (
      selectedDates.startDate !== originalStartDate ||
      selectedDates.endDate !== originalEndDate ||
      notes !== originalNotes
    );
  };

  // Validate form
  const validateForm = () => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      notifications.validationError('Pasirinkite rezervacijos datas.');
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    if (selectedDates.startDate < today) {
      notifications.validationError('Pradžios data negali būti praeityje.');
      return false;
    }

    if (selectedDates.endDate < selectedDates.startDate) {
      notifications.validationError('Pabaigos data negali būti anksčiau už pradžios datą.');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !hasChanges()) {
      if (!hasChanges()) {
        notifications.showInfo('Nėra pakeitimų išsaugojimui.');
      }
      return;
    }

    setLoading(true);
    
    try {
      const updateData = {
        startDate: selectedDates.startDate,
        endDate: selectedDates.endDate,
        notes: notes.trim()
      };

      const response = await axios.put(`/api/reservations/${reservation._id}`, updateData);
      
      notifications.reservationUpdated();
      onReservationUpdated(response.data.reservation);
      onClose();

    } catch (error) {
      console.error('Update reservation error:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        notifications.reservationError(error.response.data.error);
      } else {
        notifications.reservationError('Nepavyko atnaujinti rezervacijos.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form to original values
  const resetForm = () => {
    setSelectedDates({
      startDate: reservation.startDate.split('T')[0],
      endDate: reservation.endDate.split('T')[0]
    });
    setNotes(reservation.notes || '');
  };

  if (!reservation) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-pencil-square me-2"></i>
                Redaguoti rezervaciją
              </h5>
              <button 
                type="button" 
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            
            <div className="modal-body">
              <div className="row">
                {/* Left Column - Form */}
                <div className="col-md-6">
                  {/* Equipment Info */}
                  <div className="card bg-light mb-4">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-tools me-2"></i>
                        Įranga
                      </h6>
                      <p className="mb-2"><strong>{reservation.equipment.name}</strong></p>
                      <p className="text-muted mb-2">{reservation.equipment.category}</p>
                      <p className="mb-0">
                        <strong className="text-primary">
                          {reservation.equipment.dailyRate}€/diena
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Current vs New Dates */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <h6>Dabartinės datos:</h6>
                      <div className="d-flex align-items-center text-muted mb-2">
                        <i className="bi bi-calendar-event me-2"></i>
                        {new Date(reservation.startDate).toLocaleDateString('lt-LT')} - 
                        {new Date(reservation.endDate).toLocaleDateString('lt-LT')}
                      </div>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="row mb-3">
                    <div className="col-6">
                      <label htmlFor="startDate" className="form-label">
                        Pradžios data *
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="startDate"
                        value={selectedDates.startDate || ''}
                        onChange={(e) => setSelectedDates(prev => ({
                          ...prev,
                          startDate: e.target.value
                        }))}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="endDate" className="form-label">
                        Pabaigos data *
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="endDate"
                        value={selectedDates.endDate || ''}
                        onChange={(e) => setSelectedDates(prev => ({
                          ...prev,
                          endDate: e.target.value
                        }))}
                        min={selectedDates.startDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  {/* Calendar Toggle */}
                  <div className="mb-3">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <i className="bi bi-calendar3 me-2"></i>
                      {showCalendar ? 'Slėpti kalendorių' : 'Rodyti kalendorių'}
                    </button>
                  </div>

                  {/* Notes */}
                  <div className="mb-3">
                    <label htmlFor="notes" className="form-label">
                      Pastabos
                    </label>
                    <textarea
                      className="form-control"
                      id="notes"
                      rows="3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Papildomos pastabos arba prašymai..."
                    ></textarea>
                  </div>

                  {/* Cost Comparison */}
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Kainos palyginimas</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Dabartinė kaina:</span>
                        <span>{reservation.totalCost}€</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Nauja kaina:</span>
                        <strong className="text-primary">{calculateTotalCost()}€</strong>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Skirtumas:</strong>
                        <strong className={calculateTotalCost() - reservation.totalCost >= 0 ? 'text-warning' : 'text-success'}>
                          {calculateTotalCost() - reservation.totalCost >= 0 ? '+' : ''}
                          {calculateTotalCost() - reservation.totalCost}€
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Calendar */}
                <div className="col-md-6">
                  {showCalendar && (
                    <AvailabilityCalendar
                      equipmentId={reservation.equipment._id}
                      onDateSelect={handleDateSelect}
                      selectedDates={selectedDates}
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={resetForm}
                disabled={loading}
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Atstatyti
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Atšaukti
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !hasChanges()}
              >
                {loading ? (
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
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditReservationModal;