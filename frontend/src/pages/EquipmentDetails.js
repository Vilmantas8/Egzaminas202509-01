// EQUIPMENT DETAILS PAGE COMPONENT - ENHANCED
// This page shows detailed information about a specific piece of equipment
// Users can view specs and make reservations using the enhanced calendar
// Sprint 4 - Integrated with AvailabilityCalendar and NotificationSystem

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { useAppNotifications } from '../components/NotificationSystem';

function EquipmentDetails() {
  const { id } = useParams(); // Get equipment ID from URL
  const navigate = useNavigate();
  const notifications = useAppNotifications();
  
  // STATE
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservationLoading, setReservationLoading] = useState(false);
  
  // Reservation form state
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null
  });
  const [notes, setNotes] = useState('');
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Get current user from localStorage
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  // FUNCTIONS

  // Load equipment details when component mounts
  useEffect(() => {
    loadEquipmentDetails();
  }, [id]);

  // Function to load equipment details
  const loadEquipmentDetails = async () => {
    try {
      const response = await axios.get(`/api/equipment/${id}`);
      setEquipment(response.data);
    } catch (error) {
      console.error('Error loading equipment details:', error);
      if (error.response && error.response.status === 404) {
        setError('Įranga nerasta.');
        notifications.showError('Ieškoma įranga nerasta.');
      } else {
        setError('Nepavyko užkrauti įrangos duomenų.');
        notifications.loadError();
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = (dates) => {
    setSelectedDates(dates);
    
    // If both dates are selected, show reservation form
    if (dates.startDate && dates.endDate) {
      setShowReservationForm(true);
    }
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    if (!selectedDates.startDate || !selectedDates.endDate || !equipment) {
      return 0;
    }
    
    const startDate = new Date(selectedDates.startDate);
    const endDate = new Date(selectedDates.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // Include end date
    
    return days * equipment.dailyRate;
  };

  // Handle reservation submission
  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      notifications.showWarning('Prisijunkite, kad galėtumėte rezervuoti įrangą.');
      navigate('/login');
      return;
    }

    if (!selectedDates.startDate || !selectedDates.endDate) {
      notifications.validationError('Pasirinkite rezervacijos datas.');
      return;
    }

    setReservationLoading(true);
    
    try {
      const reservationData = {
        equipment: equipment._id,
        startDate: selectedDates.startDate,
        endDate: selectedDates.endDate,
        notes: notes.trim()
      };

      await axios.post('/api/reservations', reservationData);
      
      notifications.reservationCreated();
      
      // Navigate to reservations page with success message
      navigate('/reservations', {
        state: { message: 'Rezervacija sėkmingai sukurta!' }
      });

    } catch (error) {
      console.error('Create reservation error:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        notifications.reservationError(error.response.data.error);
      } else {
        notifications.reservationError('Nepavyko sukurti rezervacijos.');
      }
    } finally {
      setReservationLoading(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return `${price}€`;
  };

  // Get category label in Lithuanian
  const getCategoryLabel = (category) => {
    const categories = {
      'excavator': 'Ekskavatorius',
      'crane': 'Kranas',
      'bulldozer': 'Buldozeris',
      'loader': 'Krautuvas',
      'truck': 'Sunkvežimis',
      'drill': 'Gręžtuvas',
      'other': 'Kitas'
    };
    return categories[category] || category;
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Kraunasi...</span>
          </div>
          <p className="mt-3">Kraunama įrangos informacija...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="alert alert-danger">
            <h4>Klaida</h4>
            <p>{error}</p>
            <Link to="/equipment" className="btn btn-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Grįžti į įrangos sąrašą
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No equipment found
  if (!equipment) {
    return null;
  }

  return (
    <div className="equipment-details-page py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Pradžia</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/equipment">Įranga</Link>
            </li>
            <li className="breadcrumb-item active">
              {equipment.name}
            </li>
          </ol>
        </nav>

        <div className="row">
          {/* Equipment Details */}
          <div className="col-lg-8 mb-4">
            <div className="card shadow-sm">
              {/* Equipment Image */}
              <div className="equipment-image-container" style={{ height: '400px', overflow: 'hidden' }}>
                {equipment.imageUrl ? (
                  <img
                    src={equipment.imageUrl}
                    className="card-img-top equipment-image"
                    alt={equipment.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="equipment-image-placeholder d-flex align-items-center justify-content-center bg-light"
                  style={{ 
                    height: '100%',
                    display: equipment.imageUrl ? 'none' : 'flex'
                  }}
                >
                  <i className="bi bi-tools text-muted" style={{ fontSize: '4rem' }}></i>
                </div>
              </div>

              <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h1 className="h2 fw-bold mb-2">{equipment.name}</h1>
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <span className="badge bg-secondary fs-6">
                        {getCategoryLabel(equipment.category)}
                      </span>
                      <span className="badge bg-success fs-6">
                        <i className="bi bi-check-circle me-1"></i>
                        Prieinama
                      </span>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="h3 text-primary mb-0">
                      {formatPrice(equipment.dailyRate)}
                    </div>
                    <small className="text-muted">per dieną</small>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h5>Aprašymas</h5>
                  <p className="text-muted">{equipment.description}</p>
                </div>

                {/* Specifications */}
                {equipment.specifications && (
                  <div className="mb-4">
                    <h5>Techninės specifikacijos</h5>
                    <div className="card bg-light">
                      <div className="card-body">
                        <p className="mb-0">{equipment.specifications}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex gap-2 flex-wrap">
                  {isLoggedIn ? (
                    <>
                      <button
                        className="btn btn-primary btn-lg flex-grow-1"
                        onClick={() => setShowCalendar(!showCalendar)}
                      >
                        <i className="bi bi-calendar-event me-2"></i>
                        {showCalendar ? 'Slėpti kalendorių' : 'Rezervuoti dabar'}
                      </button>
                      {selectedDates.startDate && selectedDates.endDate && (
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => setShowReservationForm(true)}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          Patvirtinti rezervaciją
                        </button>
                      )}
                    </>
                  ) : (
                    <Link to="/login" className="btn btn-primary btn-lg flex-grow-1">
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Prisijunkite rezervacijai
                    </Link>
                  )}
                  
                  <Link to="/equipment" className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left me-2"></i>
                    Atgal į sąrašą
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Calendar */}
            {showCalendar && (
              <div className="card shadow-sm mb-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-calendar-range me-2"></i>
                    Prieinamumas
                  </h5>
                </div>
                <div className="card-body p-0">
                  <AvailabilityCalendar
                    equipmentId={equipment._id}
                    onDateSelect={handleDateSelect}
                    selectedDates={selectedDates}
                  />
                </div>
              </div>
            )}

            {/* Booking Summary */}
            {selectedDates.startDate && selectedDates.endDate && (
              <div className="card shadow-sm mb-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-receipt me-2"></i>
                    Rezervacijos suvestinė
                  </h5>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Pradžios data:</span>
                    <strong>{new Date(selectedDates.startDate).toLocaleDateString('lt-LT')}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Pabaigos data:</span>
                    <strong>{new Date(selectedDates.endDate).toLocaleDateString('lt-LT')}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Dienų skaičius:</span>
                    <strong>
                      {Math.ceil((new Date(selectedDates.endDate) - new Date(selectedDates.startDate)) / (1000 * 60 * 60 * 24)) + 1}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Kaina per dieną:</span>
                    <strong>{formatPrice(equipment.dailyRate)}</strong>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <strong>Iš viso:</strong>
                    <strong className="text-primary h5">
                      {formatPrice(calculateTotalCost())}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Equipment Info */}
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Informacija
                </h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="bi bi-tag me-2 text-muted"></i>
                    Kategorija: <strong>{getCategoryLabel(equipment.category)}</strong>
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-currency-euro me-2 text-muted"></i>
                    Dienos kaina: <strong>{formatPrice(equipment.dailyRate)}</strong>
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle me-2 text-success"></i>
                    Būklė: <strong>Prieinama</strong>
                  </li>
                  <li>
                    <i className="bi bi-calendar-plus me-2 text-muted"></i>
                    Pridėta: <strong>{new Date(equipment.createdAt).toLocaleDateString('lt-LT')}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Reservation Form Modal */}
        {showReservationForm && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleReservationSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      <i className="bi bi-calendar-check me-2"></i>
                      Patvirtinti rezervaciją
                    </h5>
                    <button 
                      type="button" 
                      className="btn-close"
                      onClick={() => setShowReservationForm(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {/* Summary */}
                    <div className="mb-3">
                      <h6>Įranga:</h6>
                      <p className="text-muted">{equipment.name}</p>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-6">
                        <h6>Nuo:</h6>
                        <p className="text-muted">
                          {new Date(selectedDates.startDate).toLocaleDateString('lt-LT')}
                        </p>
                      </div>
                      <div className="col-6">
                        <h6>Iki:</h6>
                        <p className="text-muted">
                          {new Date(selectedDates.endDate).toLocaleDateString('lt-LT')}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h6>Iš viso: <span className="text-primary">{formatPrice(calculateTotalCost())}</span></h6>
                    </div>

                    {/* Notes */}
                    <div className="mb-3">
                      <label htmlFor="notes" className="form-label">
                        Papildomos pastabos (neprivaloma)
                      </label>
                      <textarea
                        className="form-control"
                        id="notes"
                        rows="3"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Specialūs prašymai ar pastabos..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowReservationForm(false)}
                    >
                      Atšaukti
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={reservationLoading}
                    >
                      {reservationLoading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Kraunasi...</span>
                          </div>
                          Rezervuojama...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Patvirtinti rezervaciją
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for this page */}
      <style jsx>{`
        .equipment-image {
          transition: transform 0.3s ease;
        }
        
        .equipment-image:hover {
          transform: scale(1.02);
        }
        
        @media (max-width: 768px) {
          .equipment-details-page .col-lg-4 {
            margin-top: 2rem;
          }
          
          .equipment-image-container {
            height: 250px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default EquipmentDetails;