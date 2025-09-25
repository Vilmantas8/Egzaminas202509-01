// ADMIN DASHBOARD COMPONENT
// This page provides admin interface to manage equipment and view system statistics
// Only accessible by users with admin role

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  // STATE
  const [statistics, setStatistics] = useState({});
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState({});
  
  // Equipment form state
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    description: '',
    category: 'excavator',
    dailyRate: '',
    status: 'available',
    imageUrl: '',
    specifications: ''
  });

  // Equipment categories
  const categories = [
    { value: 'excavator', label: 'Ekskavatorius' },
    { value: 'crane', label: 'Kranas' },
    { value: 'bulldozer', label: 'Buldozeris' },
    { value: 'loader', label: 'Krautuvas' },
    { value: 'truck', label: 'Sunkvežimis' },
    { value: 'drill', label: 'Gręžtuvas' },
    { value: 'other', label: 'Kitas' }
  ];

  // FUNCTIONS

  // Load data when component mounts
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, equipmentResponse] = await Promise.all([
        axios.get('/api/admin/statistics'),
        axios.get('/api/equipment')
      ]);
      
      setStatistics(statsResponse.data);
      setEquipment(equipmentResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Nepavyko užkrauti duomenų.');
    } finally {
      setLoading(false);
    }
  };

  // Handle equipment form input changes
  const handleEquipmentFormChange = (e) => {
    setEquipmentForm({
      ...equipmentForm,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  // Validate equipment form
  const validateEquipmentForm = () => {
    if (!equipmentForm.name.trim()) {
      setError('Įveskite įrangos pavadinimą.');
      return false;
    }

    if (!equipmentForm.description.trim()) {
      setError('Įveskite įrangos aprašymą.');
      return false;
    }

    if (!equipmentForm.dailyRate || equipmentForm.dailyRate <= 0) {
      setError('Įveskite tinkamą dienos kainą.');
      return false;
    }

    return true;
  };

  // Handle equipment form submit
  const handleEquipmentFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEquipmentForm()) return;

    setActionLoading({ form: 'saving' });
    setError('');

    try {
      if (editingEquipment) {
        // Update existing equipment
        await axios.put(`/api/equipment/${editingEquipment._id}`, equipmentForm);
        setSuccessMessage('Įranga sėkmingai atnaujinta!');
      } else {
        // Create new equipment
        await axios.post('/api/equipment', equipmentForm);
        setSuccessMessage('Įranga sėkmingai sukurta!');
      }

      // Reset form and reload data
      resetEquipmentForm();
      loadDashboardData();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);

    } catch (error) {
      console.error('Equipment form error:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Nepavyko išsaugoti įrangos duomenų.');
      }
    } finally {
      setActionLoading({});
    }
  };

  // Reset equipment form
  const resetEquipmentForm = () => {
    setEquipmentForm({
      name: '',
      description: '',
      category: 'excavator',
      dailyRate: '',
      status: 'available',
      imageUrl: '',
      specifications: ''
    });
    setEditingEquipment(null);
    setShowEquipmentForm(false);
  };

  // Start editing equipment
  const startEditingEquipment = (equipment) => {
    setEquipmentForm({
      name: equipment.name,
      description: equipment.description,
      category: equipment.category,
      dailyRate: equipment.dailyRate,
      status: equipment.status,
      imageUrl: equipment.imageUrl || '',
      specifications: equipment.specifications || ''
    });
    setEditingEquipment(equipment);
    setShowEquipmentForm(true);
    setActiveTab('equipment');
  };

  // Delete equipment
  const deleteEquipment = async (equipmentId, equipmentName) => {
    if (!window.confirm(`Ar tikrai norite ištrinti įrangą "${equipmentName}"?`)) {
      return;
    }

    setActionLoading({ [equipmentId]: 'deleting' });
    
    try {
      await axios.delete(`/api/equipment/${equipmentId}`);
      setSuccessMessage('Įranga sėkmingai ištrinta!');
      loadDashboardData();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Delete equipment error:', error);
      setError('Nepavyko ištrinti įrangos.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setActionLoading({});
    }
  };

  // Get category label
  const getCategoryLabel = (category) => {
    const found = categories.find(cat => cat.value === category);
    return found ? found.label : category;
  };

  // Get status label and badge class
  const getStatusInfo = (status) => {
    const statusInfo = {
      'available': { label: 'Prieinama', class: 'bg-success' },
      'rented': { label: 'Išnuomota', class: 'bg-primary' },
      'maintenance': { label: 'Remontas', class: 'bg-warning' },
      'draft': { label: 'Juodraštis', class: 'bg-secondary' }
    };
    return statusInfo[status] || { label: status, class: 'bg-secondary' };
  };

  // Format price
  const formatPrice = (price) => {
    return `${price}€/diena`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Kraunasi...</span>
          </div>
          <p className="mt-3">Kraunama administratoriaus skydelis...</p>
        </div>
      </div>
    );
  }  return (
    <div className="admin-dashboard-page py-5">
      <div className="container-fluid">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center">
              <i className="bi bi-shield-check display-4 text-primary me-3"></i>
              <div>
                <h1 className="fw-bold mb-1">Administratoriaus skydelis</h1>
                <p className="text-muted mb-0">
                  Valdykite sistemos įrangą ir peržiūrėkite statistikas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            {successMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccessMessage('')}
            ></button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError('')}
            ></button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <i className="bi bi-bar-chart me-2"></i>
                  Apžvalga
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'equipment' ? 'active' : ''}`}
                  onClick={() => setActiveTab('equipment')}
                >
                  <i className="bi bi-tools me-2"></i>
                  Įrangos valdymas
                </button>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/reservations">
                  <i className="bi bi-calendar-check me-2"></i>
                  Rezervacijos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* Statistics Cards */}
            <div className="row mb-5">
              <div className="col-sm-6 col-xl-3 mb-4">
                <div className="card bg-primary text-white h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-tools display-4 me-3"></i>
                      <div>
                        <div className="h2 mb-0">{statistics.totalEquipment || 0}</div>
                        <div>Viso įrangos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-xl-3 mb-4">
                <div className="card bg-success text-white h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-circle display-4 me-3"></i>
                      <div>
                        <div className="h2 mb-0">{statistics.availableEquipment || 0}</div>
                        <div>Prieinamų</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-xl-3 mb-4">
                <div className="card bg-warning text-white h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-calendar-event display-4 me-3"></i>
                      <div>
                        <div className="h2 mb-0">{statistics.totalReservations || 0}</div>
                        <div>Rezervacijų</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-xl-3 mb-4">
                <div className="card bg-info text-white h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-people display-4 me-3"></i>
                      <div>
                        <div className="h2 mb-0">{statistics.totalUsers || 0}</div>
                        <div>Vartotojų</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Reservations Alert */}
            {statistics.pendingReservations > 0 && (
              <div className="row mb-4">
                <div className="col-12">
                  <div className="alert alert-warning">
                    <h5 className="alert-heading">
                      <i className="bi bi-clock me-2"></i>
                      Laukiančios rezervacijos
                    </h5>
                    <p className="mb-2">
                      Turite <strong>{statistics.pendingReservations}</strong> rezervacijų, 
                      kurios laukia jūsų patvirtinimo.
                    </p>
                    <Link to="/reservations" className="btn btn-warning">
                      <i className="bi bi-calendar-check me-2"></i>
                      Peržiūrėti rezervacijas
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity (Placeholder) */}
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-activity me-2"></i>
                      Greita navigacija
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <div className="d-grid">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => setActiveTab('equipment')}
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            Pridėti naują įrangą
                          </button>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="d-grid">
                          <Link to="/reservations" className="btn btn-outline-primary">
                            <i className="bi bi-calendar-check me-2"></i>
                            Valdyti rezervacijas
                          </Link>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="d-grid">
                          <Link to="/equipment" className="btn btn-outline-primary">
                            <i className="bi bi-eye me-2"></i>
                            Peržiūrėti kaip vartotojas
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="tab-content">
            {/* Equipment Management Header */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <h3>Įrangos valdymas</h3>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      resetEquipmentForm();
                      setShowEquipmentForm(true);
                    }}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Pridėti įrangą
                  </button>
                </div>
              </div>
            </div>

            {/* Equipment Form */}
            {showEquipmentForm && (
              <div className="row mb-5">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title mb-0">
                        {editingEquipment ? 'Redaguoti įrangą' : 'Pridėti naują įrangą'}
                      </h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleEquipmentFormSubmit}>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="name" className="form-label">
                              Pavadinimas *
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="name"
                              name="name"
                              value={equipmentForm.name}
                              onChange={handleEquipmentFormChange}
                              required
                            />
                          </div>

                          <div className="col-md-3 mb-3">
                            <label htmlFor="category" className="form-label">
                              Kategorija *
                            </label>
                            <select
                              className="form-select"
                              id="category"
                              name="category"
                              value={equipmentForm.category}
                              onChange={handleEquipmentFormChange}
                              required
                            >
                              {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-3 mb-3">
                            <label htmlFor="status" className="form-label">
                              Būsena *
                            </label>
                            <select
                              className="form-select"
                              id="status"
                              name="status"
                              value={equipmentForm.status}
                              onChange={handleEquipmentFormChange}
                              required
                            >
                              <option value="available">Prieinama</option>
                              <option value="maintenance">Remontas</option>
                              <option value="draft">Juodraštis</option>
                            </select>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="dailyRate" className="form-label">
                              Dienos kaina (€) *
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              id="dailyRate"
                              name="dailyRate"
                              value={equipmentForm.dailyRate}
                              onChange={handleEquipmentFormChange}
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="imageUrl" className="form-label">
                              Nuotraukos URL
                            </label>
                            <input
                              type="url"
                              className="form-control"
                              id="imageUrl"
                              name="imageUrl"
                              value={equipmentForm.imageUrl}
                              onChange={handleEquipmentFormChange}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label htmlFor="description" className="form-label">
                            Aprašymas *
                          </label>
                          <textarea
                            className="form-control"
                            id="description"
                            name="description"
                            value={equipmentForm.description}
                            onChange={handleEquipmentFormChange}
                            rows="3"
                            required
                          ></textarea>
                        </div>

                        <div className="mb-3">
                          <label htmlFor="specifications" className="form-label">
                            Specifikacijos
                          </label>
                          <textarea
                            className="form-control"
                            id="specifications"
                            name="specifications"
                            value={equipmentForm.specifications}
                            onChange={handleEquipmentFormChange}
                            rows="3"
                            placeholder="Techninės specifikacijos, matmenys, galinguimas, ir kt."
                          ></textarea>
                        </div>

                        <div className="d-flex gap-2">
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={actionLoading.form}
                          >
                            {actionLoading.form === 'saving' ? (
                              <>
                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                  <span className="visually-hidden">Kraunasi...</span>
                                </div>
                                Išsaugoma...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check me-2"></i>
                                {editingEquipment ? 'Atnaujinti' : 'Sukurti'}
                              </>
                            )}
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={resetEquipmentForm}
                          >
                            Atšaukti
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Equipment List */}
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      Įrangos sąrašas ({equipment.length})
                    </h5>
                  </div>
                  <div className="card-body">
                    {equipment.length === 0 ? (
                      <div className="text-center py-4">
                        <i className="bi bi-tools display-1 text-muted mb-3"></i>
                        <h5>Įrangos nėra</h5>
                        <p className="text-muted">Pradėkite pridėdami pirmą įrangos vienetą.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Pavadinimas</th>
                              <th>Kategorija</th>
                              <th>Kaina/d.</th>
                              <th>Būsena</th>
                              <th>Sukurta</th>
                              <th>Veiksmai</th>
                            </tr>
                          </thead>
                          <tbody>
                            {equipment.map(item => {
                              const statusInfo = getStatusInfo(item.status);
                              return (
                                <tr key={item._id}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      {item.imageUrl ? (
                                        <img 
                                          src={item.imageUrl} 
                                          alt={item.name}
                                          className="me-3 rounded"
                                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <div 
                                          className="me-3 bg-light rounded d-flex align-items-center justify-content-center"
                                          style={{ width: '50px', height: '50px' }}
                                        >
                                          <i className="bi bi-tools text-muted"></i>
                                        </div>
                                      )}
                                      <div>
                                        <div className="fw-bold">{item.name}</div>
                                        <small className="text-muted">
                                          {item.description.length > 50 
                                            ? `${item.description.substring(0, 50)}...` 
                                            : item.description
                                          }
                                        </small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="badge bg-secondary">
                                      {getCategoryLabel(item.category)}
                                    </span>
                                  </td>
                                  <td className="fw-bold">{formatPrice(item.dailyRate)}</td>
                                  <td>
                                    <span className={`badge ${statusInfo.class}`}>
                                      {statusInfo.label}
                                    </span>
                                  </td>
                                  <td>
                                    <small className="text-muted">
                                      {new Date(item.createdAt).toLocaleDateString('lt-LT')}
                                    </small>
                                  </td>
                                  <td>
                                    <div className="btn-group btn-group-sm">
                                      <button 
                                        className="btn btn-outline-primary"
                                        onClick={() => startEditingEquipment(item)}
                                        title="Redaguoti"
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </button>
                                      <Link 
                                        to={`/equipment/${item._id}`}
                                        className="btn btn-outline-info"
                                        title="Peržiūrėti"
                                      >
                                        <i className="bi bi-eye"></i>
                                      </Link>
                                      <button 
                                        className="btn btn-outline-danger"
                                        onClick={() => deleteEquipment(item._id, item.name)}
                                        disabled={actionLoading[item._id]}
                                        title="Ištrinti"
                                      >
                                        {actionLoading[item._id] === 'deleting' ? (
                                          <div className="spinner-border spinner-border-sm" role="status">
                                            <span className="visually-hidden">Kraunasi...</span>
                                          </div>
                                        ) : (
                                          <i className="bi bi-trash"></i>
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;