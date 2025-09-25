// ADVANCED FILTERS COMPONENT
// Enhanced filtering interface for equipment with price range, date availability, and specifications
// Part of Sprint 4 - T035 Advanced Filtering

import React, { useState, useEffect } from 'react';

function AdvancedFilters({ 
  onFiltersChange, 
  equipment, 
  initialFilters = {} 
}) {
  // STATE
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    priceRange: [0, 1000],
    availability: {
      startDate: '',
      endDate: ''
    },
    sortBy: 'name',
    sortOrder: 'asc',
    ...initialFilters
  });

  const [priceStats, setPriceStats] = useState({ min: 0, max: 1000 });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Equipment categories
  const categories = [
    { value: '', label: 'Visi tipai' },
    { value: 'excavator', label: 'Ekskavatoriai' },
    { value: 'crane', label: 'Kranai' },
    { value: 'bulldozer', label: 'Buldozeriai' },
    { value: 'loader', label: 'Krautuvai' },
    { value: 'truck', label: 'Sunkvežimiai' },
    { value: 'drill', label: 'Gręžtuvai' },
    { value: 'other', label: 'Kiti' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Pavadinimas' },
    { value: 'dailyRate', label: 'Kaina' },
    { value: 'category', label: 'Kategorija' },
    { value: 'createdAt', label: 'Naujumas' }
  ];

  // Calculate price statistics from equipment
  useEffect(() => {
    if (equipment && equipment.length > 0) {
      const prices = equipment.map(item => item.dailyRate);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      setPriceStats({ min: minPrice, max: maxPrice });
      
      // Update price range if not set by user
      if (filters.priceRange[0] === 0 && filters.priceRange[1] === 1000) {
        setFilters(prev => ({
          ...prev,
          priceRange: [minPrice, maxPrice]
        }));
      }
    }
  }, [equipment]);

  // Notify parent component when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle nested input changes (like availability dates)
  const handleNestedChange = (parent, field, value) => {
    setFilters(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Handle price range change
  const handlePriceRangeChange = (index, value) => {
    const newRange = [...filters.priceRange];
    newRange[index] = parseInt(value);
    
    // Ensure min <= max
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[1] = newRange[0];
    } else if (index === 1 && newRange[1] < newRange[0]) {
      newRange[0] = newRange[1];
    }
    
    handleInputChange('priceRange', newRange);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      category: '',
      priceRange: [priceStats.min, priceStats.max],
      availability: {
        startDate: '',
        endDate: ''
      },
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.category) count++;
    if (filters.priceRange[0] !== priceStats.min || filters.priceRange[1] !== priceStats.max) count++;
    if (filters.availability.startDate || filters.availability.endDate) count++;
    if (filters.sortBy !== 'name' || filters.sortOrder !== 'asc') count++;
    return count;
  };

  const activeFilters = getActiveFilterCount();

  return (
    <div className="advanced-filters">
      {/* Basic Filters Row */}
      <div className="row g-3 mb-3">
        {/* Search */}
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Ieškoti įrangos pagal pavadinimą, aprašymą..."
              value={filters.searchTerm}
              onChange={(e) => handleInputChange('searchTerm', e.target.value)}
            />
            {filters.searchTerm && (
              <button 
                className="btn btn-outline-secondary" 
                type="button"
                onClick={() => handleInputChange('searchTerm', '')}
                title="Išvalyti paiešką"
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="col-md-3">
          <select
            className="form-select"
            value={filters.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Toggle */}
        <div className="col-md-3">
          <div className="d-flex gap-2">
            <button
              className={`btn btn-outline-primary flex-fill ${showAdvanced ? 'active' : ''}`}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <i className="bi bi-funnel me-2"></i>
              Filtrai
              {activeFilters > 0 && (
                <span className="badge bg-primary ms-2">{activeFilters}</span>
              )}
            </button>
            
            {activeFilters > 0 && (
              <button
                className="btn btn-outline-secondary"
                onClick={clearFilters}
                title="Išvalyti visus filtrus"
              >
                <i className="bi bi-x-circle"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="card">
          <div className="card-body">
            <div className="row g-3">
              {/* Price Range */}
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  <i className="bi bi-currency-euro me-2"></i>
                  Kainos intervalas (per dieną)
                </label>
                <div className="price-range-container">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: '80px' }}
                      min={priceStats.min}
                      max={priceStats.max}
                      value={filters.priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    />
                    <span className="text-muted">€ iki</span>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: '80px' }}
                      min={priceStats.min}
                      max={priceStats.max}
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    />
                    <span className="text-muted">€</span>
                  </div>
                  
                  {/* Price Range Sliders */}
                  <div className="position-relative">
                    <input
                      type="range"
                      className="form-range position-absolute w-100"
                      min={priceStats.min}
                      max={priceStats.max}
                      value={filters.priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                      style={{ zIndex: 1 }}
                    />
                    <input
                      type="range"
                      className="form-range w-100"
                      min={priceStats.min}
                      max={priceStats.max}
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                      style={{ zIndex: 2 }}
                    />
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">{priceStats.min}€</small>
                    <small className="text-muted">{priceStats.max}€</small>
                  </div>
                </div>
              </div>

              {/* Date Availability */}
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  <i className="bi bi-calendar-range me-2"></i>
                  Prieinamumas periode
                </label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={filters.availability.startDate}
                      onChange={(e) => handleNestedChange('availability', 'startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <small className="text-muted">Nuo</small>
                  </div>
                  <div className="col-6">
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={filters.availability.endDate}
                      onChange={(e) => handleNestedChange('availability', 'endDate', e.target.value)}
                      min={filters.availability.startDate || new Date().toISOString().split('T')[0]}
                    />
                    <small className="text-muted">Iki</small>
                  </div>
                </div>
              </div>

              {/* Sorting */}
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  <i className="bi bi-sort-down me-2"></i>
                  Rūšiavimas
                </label>
                <div className="d-flex gap-2">
                  <select
                    className="form-select form-select-sm"
                    value={filters.sortBy}
                    onChange={(e) => handleInputChange('sortBy', e.target.value)}
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className={`btn btn-outline-secondary btn-sm ${filters.sortOrder === 'desc' ? 'active' : ''}`}
                    onClick={() => handleInputChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    title={filters.sortOrder === 'asc' ? 'Didėjančia tvarka' : 'Mažėjančia tvarka'}
                  >
                    <i className={`bi bi-sort-${filters.sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                  </button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  <i className="bi bi-lightning me-2"></i>
                  Greiti filtrai
                </label>
                <div className="d-flex flex-wrap gap-1">
                  <button
                    className={`btn btn-outline-success btn-sm ${
                      filters.priceRange[1] <= 100 ? 'active' : ''
                    }`}
                    onClick={() => handleInputChange('priceRange', [priceStats.min, Math.min(100, priceStats.max)])}
                  >
                    Iki 100€
                  </button>
                  <button
                    className={`btn btn-outline-info btn-sm ${
                      filters.category === 'excavator' ? 'active' : ''
                    }`}
                    onClick={() => handleInputChange('category', filters.category === 'excavator' ? '' : 'excavator')}
                  >
                    Ekskavatoriai
                  </button>
                  <button
                    className={`btn btn-outline-warning btn-sm ${
                      filters.sortBy === 'dailyRate' ? 'active' : ''
                    }`}
                    onClick={() => {
                      handleInputChange('sortBy', 'dailyRate');
                      handleInputChange('sortOrder', 'asc');
                    }}
                  >
                    Pigiausi pirma
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="mt-3 pt-3 border-top">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  {activeFilters > 0 ? (
                    <>Aktyvių filtrų: <strong>{activeFilters}</strong></>
                  ) : (
                    'Naudokite filtrus, kad surastumėte tinkamą įrangą greičiau'
                  )}
                </small>
                
                {activeFilters > 0 && (
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={clearFilters}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i>
                      Išvalyti
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowAdvanced(false)}
                    >
                      <i className="bi bi-check me-1"></i>
                      Taikyti
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Tags */}
      {activeFilters > 0 && !showAdvanced && (
        <div className="active-filters-tags mb-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <small className="text-muted me-2">Aktyvūs filtrai:</small>
            
            {filters.searchTerm && (
              <span className="badge bg-primary">
                Paieška: "{filters.searchTerm}"
                <button 
                  className="btn-close btn-close-white ms-2" 
                  style={{ fontSize: '0.7em' }}
                  onClick={() => handleInputChange('searchTerm', '')}
                ></button>
              </span>
            )}
            
            {filters.category && (
              <span className="badge bg-secondary">
                {categories.find(c => c.value === filters.category)?.label}
                <button 
                  className="btn-close btn-close-white ms-2" 
                  style={{ fontSize: '0.7em' }}
                  onClick={() => handleInputChange('category', '')}
                ></button>
              </span>
            )}
            
            {(filters.priceRange[0] !== priceStats.min || filters.priceRange[1] !== priceStats.max) && (
              <span className="badge bg-success">
                {filters.priceRange[0]}€ - {filters.priceRange[1]}€
                <button 
                  className="btn-close btn-close-white ms-2" 
                  style={{ fontSize: '0.7em' }}
                  onClick={() => handleInputChange('priceRange', [priceStats.min, priceStats.max])}
                ></button>
              </span>
            )}
            
            {(filters.availability.startDate || filters.availability.endDate) && (
              <span className="badge bg-info">
                Datos: {filters.availability.startDate || '?'} - {filters.availability.endDate || '?'}
                <button 
                  className="btn-close btn-close-white ms-2" 
                  style={{ fontSize: '0.7em' }}
                  onClick={() => handleNestedChange('availability', 'startDate', '') || handleNestedChange('availability', 'endDate', '')}
                ></button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedFilters;