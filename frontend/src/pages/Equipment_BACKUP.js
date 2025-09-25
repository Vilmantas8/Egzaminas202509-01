// EQUIPMENT PAGE COMPONENT - ENHANCED WITH ADVANCED FILTERING
// This page shows all available construction equipment with advanced filtering capabilities
// Users can browse, search, filter by price/date/category, and view equipment details
// Sprint 4 - T035 Advanced Filtering Implementation

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdvancedFilters from '../components/AdvancedFilters';

function Equipment() {
  // STATE - variables that can change
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservations, setReservations] = useState([]); // For availability checking

  // FUNCTIONS

  // Load equipment when component mounts
  useEffect(() => {
    loadEquipment();
    loadReservations(); // Load reservations for availability checking
  }, []);

  // Function to load equipment from backend
  const loadEquipment = async () => {
    try {
      const response = await axios.get('/api/equipment');
      setEquipment(response.data);
      setFilteredEquipment(response.data); // Initialize filtered list
    } catch (error) {
      console.error('Error loading equipment:', error);
      setError('Nepavyko užkrauti įrangos sąrašo.');
    } finally {
      setLoading(false);
    }
  };

  // Function to load reservations for availability checking
  const loadReservations = async () => {
    try {
      const response = await axios.get('/api/reservations');
      setReservations(response.data);
    } catch (error) {
      console.error('Error loading reservations:', error);
      // Don't show error for reservations, as they're optional for filtering
    }
  };

  // Function to get category label in Lithuanian
  const getCategoryLabel = (category) => {
    const categories = [
      { value: 'excavator', label: 'Ekskavatorius' },
      { value: 'crane', label: 'Kranas' },
      { value: 'bulldozer', label: 'Buldozeris' },
      { value: 'loader', label: 'Krautuvas' },
      { value: 'truck', label: 'Sunkvežimis' },
      { value: 'drill', label: 'Gręžtuvas' },
      { value: 'other', label: 'Kitas' }
    ];
    const found = categories.find(cat => cat.value === category);
    return found ? found.label : category;
  };

  // Function to format price
  const formatPrice = (price) => {
    return `${price}€/diena`;
  };

  // Function to check if equipment is available for given date range
  const isEquipmentAvailable = (equipmentId, startDate, endDate) => {
    if (!startDate || !endDate) return true; // No date filter applied
    
    const conflictingReservations = reservations.filter(reservation => {
      return (
        reservation.equipment._id === equipmentId &&
        ['confirmed', 'active', 'pending'].includes(reservation.status) &&
        (
          (new Date(reservation.startDate) < new Date(endDate)) &&
          (new Date(reservation.endDate) > new Date(startDate))
        )
      );
    });

    return conflictingReservations.length === 0;
  };

  // Function to apply filters to equipment list
  const handleFiltersChange = (filters) => {
    let filtered = equipment.filter(item => {
      // Basic filters
      const matchesSearch = 
        item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (item.specifications && item.specifications.toLowerCase().includes(filters.searchTerm.toLowerCase()));
        
      const matchesCategory = !filters.category || item.category === filters.category;
      const isAvailable = item.status === 'available';
      
      // Price range filter
      const matchesPrice = 
        item.dailyRate >= filters.priceRange[0] && 
        item.dailyRate <= filters.priceRange[1];
      
      // Date availability filter
      const matchesAvailability = isEquipmentAvailable(
        item._id, 
        filters.availability.startDate, 
        filters.availability.endDate
      );
      
      return matchesSearch && matchesCategory && isAvailable && matchesPrice && matchesAvailability;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'dailyRate':
          compareValue = a.dailyRate - b.dailyRate;
          break;
        case 'category':
          compareValue = a.category.localeCompare(b.category);
          break;
        case 'createdAt':
          compareValue = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          compareValue = 0;
      }
      
      return filters.sortOrder === 'desc' ? -compareValue : compareValue;
    });

    setFilteredEquipment(filtered);
  };

  // Get equipment availability status for display
  const getAvailabilityStatus = (item) => {
    // Check if equipment has any conflicting reservations in near future
    const upcomingReservations = reservations.filter(reservation => {
      const isForThisEquipment = reservation.equipment._id === item._id;
      const isActive = ['confirmed', 'active', 'pending'].includes(reservation.status);
      const isUpcoming = new Date(reservation.startDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Next 30 days
      
      return isForThisEquipment && isActive && isUpcoming;
    });

    if (upcomingReservations.length > 0) {
      const nextReservation = upcomingReservations.sort((a, b) => 
        new Date(a.startDate) - new Date(b.startDate)
      )[0];
      
      return {
        status: 'limited',
        message: `Rezervuota nuo ${new Date(nextReservation.startDate).toLocaleDateString('lt-LT')}`,
        class: 'bg-warning'
      };
    }

    return {
      status: 'available',
      message: 'Prieinama',
      class: 'bg-success'
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Kraunasi...</span>
          </div>
          <p className="mt-3">Kraunama įranga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="equipment-page py-5">
      <div className="container">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="text-center">
              <i className="bi bi-tools display-4 text-primary mb-3"></i>
              <h1 className="fw-bold">Statybos Įranga</h1>
              <p className="lead text-muted">
                Raskite ir išsinuomokite reikalingą statybos įrangą
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="row mb-4">
          <div className="col-12">
            <AdvancedFilters 
              onFiltersChange={handleFiltersChange}
              equipment={equipment}
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="d-flex align-items-center">
              <h5 className="mb-0 me-3">
                Rasta <span className="text-primary">{filteredEquipment.length}</span> įrangos vnt.
              </h5>
              {filteredEquipment.length !== equipment.length && (
                <small className="text-muted">
                  (iš viso {equipment.length})
                </small>
              )}
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex justify-content-end gap-2">
              {/* View Toggle - could be expanded in future */}
              <div className="btn-group" role="group">
                <button type="button" className="btn btn-outline-secondary active btn-sm">
                  <i className="bi bi-grid"></i>
                </button>
                <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
                  <i className="bi bi-list"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        {/* Equipment Grid */}
        <div className="row">
          {filteredEquipment.length === 0 ? (
            <div className="col-12">
              <div className="text-center py-5">
                <i className="bi bi-funnel display-1 text-muted mb-3"></i>
                <h4>Įrangos nerasta</h4>
                <p className="text-muted mb-4">
                  Pagal nustatytus filtrus įranga nerasta.
                  <br />
                  Pabandykite pakeisti paieškos kriterijus.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => handleFiltersChange({
                      searchTerm: '',
                      category: '',
                      priceRange: [0, 1000],
                      availability: { startDate: '', endDate: '' },
                      sortBy: 'name',
                      sortOrder: 'asc'
                    })}
                  >
                    <i className="bi bi-arrow-counterclockwise me-2"></i>
                    Išvalyti filtrus
                  </button>
                  <Link to="/" className="btn btn-secondary">
                    <i className="bi bi-house me-2"></i>
                    Grįžti į pradžią
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            filteredEquipment.map(item => {
              const availability = getAvailabilityStatus(item);
              
              return (
                <div key={item._id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow-sm hover-shadow">
                    {/* Equipment Image */}
                    <div className="position-relative">
                      <div className="card-img-top-wrapper" style={{ height: '200px', overflow: 'hidden' }}>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            className="card-img-top"
                            alt={item.name}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="card-img-placeholder d-flex align-items-center justify-content-center bg-light"
                          style={{ 
                            height: '100%',
                            display: item.imageUrl ? 'none' : 'flex'
                          }}
                        >
                          <i className="bi bi-tools text-muted" style={{ fontSize: '3rem' }}></i>
                        </div>
                      </div>
                      
                      {/* Availability Badge */}
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className={`badge ${availability.class}`}>
                          <i className="bi bi-check-circle me-1"></i>
                          {availability.status === 'available' ? 'Laisva' : 'Ribota'}
                        </span>
                      </div>
                    </div>

                    <div className="card-body d-flex flex-column">
                      {/* Category Badge */}
                      <div className="mb-2">
                        <span className="badge bg-secondary">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>

                      {/* Equipment Name */}
                      <h5 className="card-title fw-bold">{item.name}</h5>

                      {/* Equipment Description */}
                      <p className="card-text text-muted flex-grow-1">
                        {item.description.length > 100 
                          ? `${item.description.substring(0, 100)}...` 
                          : item.description
                        }
                      </p>

                      {/* Specifications Preview */}
                      {item.specifications && (
                        <div className="mb-3">
                          <small className="text-muted">
                            <i className="bi bi-gear me-1"></i>
                            {item.specifications.length > 60 
                              ? `${item.specifications.substring(0, 60)}...` 
                              : item.specifications
                            }
                          </small>
                        </div>
                      )}

                      {/* Price and Status */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="price">
                          <strong className="text-primary fs-5">
                            {formatPrice(item.dailyRate)}
                          </strong>
                        </div>
                        <div className="status">
                          <small className="text-muted">{availability.message}</small>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-grid">
                        <Link 
                          to={`/equipment/${item._id}`}
                          className="btn btn-primary"
                        >
                          <i className="bi bi-eye me-2"></i>
                          Žiūrėti detaliau
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Equipment Statistics */}
        {filteredEquipment.length > 0 && (
          <div className="row mt-5">
            <div className="col-12">
              <div className="card bg-light">
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-sm-3 mb-3">
                      <div className="h4 text-primary mb-1">
                        {filteredEquipment.length}
                      </div>
                      <small className="text-muted">Įrangos vienetų</small>
                    </div>
                    <div className="col-sm-3 mb-3">
                      <div className="h4 text-success mb-1">
                        {filteredEquipment.filter(item => getAvailabilityStatus(item).status === 'available').length}
                      </div>
                      <small className="text-muted">Laisvų dabar</small>
                    </div>
                    <div className="col-sm-3 mb-3">
                      <div className="h4 text-info mb-1">
                        {Math.round(filteredEquipment.reduce((sum, item) => sum + item.dailyRate, 0) / filteredEquipment.length) || 0}€
                      </div>
                      <small className="text-muted">Vid. kaina/dienai</small>
                    </div>
                    <div className="col-sm-3 mb-3">
                      <div className="h4 text-warning mb-1">
                        {new Set(filteredEquipment.map(item => item.category)).size}
                      </div>
                      <small className="text-muted">Kategorijų</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-info">
              <h6 className="fw-bold mb-2">
                <i className="bi bi-lightbulb me-2"></i>
                Patarimai efektyvesnei paieškai
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <ul className="mb-0 small">
                    <li>Naudokite kainos filtrą, kad rastumėte tinkamą biudžetą</li>
                    <li>Nurodykite datas, kad matytumėte tik laisvą įrangą</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="mb-0 small">
                    <li>Ieškokite pagal specifikacijas (pvz., "10 tonų")</li>
                    <li>Rūšiuokite pagal kainą, kad rastumėte geriausius pasiūlymus</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for hover effects */}
      <style jsx>{`
        .hover-shadow {
          transition: box-shadow 0.3s ease;
        }
        .hover-shadow:hover {
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
          transform: translateY(-2px);
        }
        .card-img-top-wrapper:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

export default Equipment;