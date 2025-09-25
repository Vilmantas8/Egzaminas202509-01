// AVAILABILITY CALENDAR COMPONENT
// Visual calendar component showing equipment availability and reservations
// Sprint 4 - T036 Availability Calendar Implementation

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AvailabilityCalendar({ equipmentId, onDateSelect, selectedDates = { startDate: null, endDate: null } }) {
  // STATE
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingStart, setSelectingStart] = useState(true);
  const [hoveredDate, setHoveredDate] = useState(null);

  // FUNCTIONS

  // Load reservations when component mounts or equipment changes
  useEffect(() => {
    if (equipmentId) {
      loadReservations();
    }
  }, [equipmentId]);

  // Function to load reservations for this equipment
  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reservations');
      
      // Filter reservations for this equipment only
      const equipmentReservations = response.data.filter(reservation => 
        reservation.equipment._id === equipmentId &&
        ['confirmed', 'active', 'pending'].includes(reservation.status)
      );
      
      setReservations(equipmentReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Check if a date is reserved
  const isDateReserved = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    return reservations.some(reservation => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      
      // Add one day to end date to include the end date
      endDate.setDate(endDate.getDate() + 1);
      
      return date >= startDate && date < endDate;
    });
  };

  // Get reservation for a specific date
  const getReservationForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    return reservations.find(reservation => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      endDate.setDate(endDate.getDate() + 1);
      
      return date >= startDate && date < endDate;
    });
  };

  // Check if date is in the past
  const isDatePast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if date is selected
  const isDateSelected = (date) => {
    if (!selectedDates.startDate) return false;
    
    const startDate = new Date(selectedDates.startDate);
    const endDate = selectedDates.endDate ? new Date(selectedDates.endDate) : null;
    
    if (!endDate) {
      return date.toDateString() === startDate.toDateString();
    }
    
    return date >= startDate && date <= endDate;
  };

  // Check if date is in selection range (when hovering)
  const isDateInRange = (date) => {
    if (!selectedDates.startDate || !hoveredDate) return false;
    
    const startDate = new Date(selectedDates.startDate);
    const endDate = hoveredDate;
    
    if (startDate > endDate) {
      return date >= endDate && date <= startDate;
    }
    
    return date >= startDate && date <= endDate;
  };

  // Handle date click
  const handleDateClick = (date) => {
    if (isDatePast(date) || isDateReserved(date)) return;
    
    if (selectingStart || !selectedDates.startDate) {
      // Selecting start date
      onDateSelect({
        startDate: date.toISOString().split('T')[0],
        endDate: null
      });
      setSelectingStart(false);
    } else {
      // Selecting end date
      const startDate = new Date(selectedDates.startDate);
      
      if (date < startDate) {
        // If selected date is before start date, make it the new start date
        onDateSelect({
          startDate: date.toISOString().split('T')[0],
          endDate: null
        });
        setSelectingStart(false);
      } else {
        // Normal end date selection
        onDateSelect({
          startDate: selectedDates.startDate,
          endDate: date.toISOString().split('T')[0]
        });
        setSelectingStart(true);
      }
    }
  };

  // Handle date hover
  const handleDateHover = (date) => {
    if (!selectedDates.startDate || selectingStart) return;
    setHoveredDate(date);
  };

  // Clear selection
  const clearSelection = () => {
    onDateSelect({ startDate: null, endDate: null });
    setSelectingStart(true);
    setHoveredDate(null);
  };

  // Get CSS class for date cell
  const getDateClass = (date) => {
    const classes = ['calendar-date'];
    
    if (isDatePast(date)) {
      classes.push('date-past');
    } else if (isDateReserved(date)) {
      classes.push('date-reserved');
    } else if (isDateSelected(date)) {
      classes.push('date-selected');
    } else if (isDateInRange(date)) {
      classes.push('date-in-range');
    } else {
      classes.push('date-available');
    }
    
    return classes.join(' ');
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-date date-empty"></div>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const reservation = getReservationForDate(date);
      
      days.push(
        <div
          key={day}
          className={getDateClass(date)}
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => handleDateHover(date)}
          onMouseLeave={() => setHoveredDate(null)}
          title={
            isDatePast(date) 
              ? 'Praėjusi data'
              : isDateReserved(date)
              ? `Rezervuota: ${reservation?.status === 'pending' ? 'Laukia patvirtinimo' : 'Patvirtinta'}`
              : 'Spustelėkite, kad pasirinktumėte'
          }
        >
          <span className="date-number">{day}</span>
          {isDateReserved(date) && (
            <div className="reservation-indicator">
              <i className="bi bi-circle-fill"></i>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  // Month names in Lithuanian
  const monthNames = [
    'Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis',
    'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis'
  ];

  // Day names in Lithuanian
  const dayNames = ['Sek', 'Pir', 'Ant', 'Tre', 'Ket', 'Pen', 'Šeš'];

  if (loading) {
    return (
      <div className="availability-calendar loading">
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Kraunasi...</span>
          </div>
          <p className="mt-2 mb-0">Kraunamas kalendorius...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="availability-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={previousMonth}
            disabled={currentDate.getFullYear() === new Date().getFullYear() && 
                     currentDate.getMonth() <= new Date().getMonth()}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          
          <h5 className="mb-0">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h5>
          
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={nextMonth}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        {/* Instructions */}
        <div className="calendar-instructions mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              {!selectedDates.startDate 
                ? 'Pasirinkite atvykimo datą'
                : !selectedDates.endDate
                ? 'Pasirinkite išvykimo datą'
                : `${new Date(selectedDates.startDate).toLocaleDateString('lt-LT')} - ${new Date(selectedDates.endDate).toLocaleDateString('lt-LT')}`
              }
            </small>
            
            {(selectedDates.startDate || selectedDates.endDate) && (
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={clearSelection}
              >
                <i className="bi bi-x"></i> Išvalyti
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Day headers */}
        <div className="calendar-row calendar-header-row">
          {dayNames.map(dayName => (
            <div key={dayName} className="calendar-header-cell">
              {dayName}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="calendar-body">
          {generateCalendarDays()}
        </div>
      </div>

      {/* Legend */}
      <div className="calendar-legend mt-3">
        <div className="row text-center">
          <div className="col-3">
            <div className="legend-item">
              <span className="legend-color date-available"></span>
              <small>Laisva</small>
            </div>
          </div>
          <div className="col-3">
            <div className="legend-item">
              <span className="legend-color date-selected"></span>
              <small>Pasirinkta</small>
            </div>
          </div>
          <div className="col-3">
            <div className="legend-item">
              <span className="legend-color date-reserved"></span>
              <small>Rezervuota</small>
            </div>
          </div>
          <div className="col-3">
            <div className="legend-item">
              <span className="legend-color date-past"></span>
              <small>Praėjo</small>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .availability-calendar {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .calendar-grid {
          border: 1px solid #e9ecef;
          border-radius: 6px;
          overflow: hidden;
        }

        .calendar-header-row {
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .calendar-header-cell {
          padding: 10px 5px;
          text-align: center;
          font-weight: 600;
          color: #6c757d;
          font-size: 0.85rem;
          width: calc(100% / 7);
          display: inline-block;
        }

        .calendar-body {
          display: flex;
          flex-wrap: wrap;
        }

        .calendar-date {
          width: calc(100% / 7);
          height: 45px;
          border-right: 1px solid #e9ecef;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calendar-date:nth-child(7n) {
          border-right: none;
        }

        .calendar-date.date-empty {
          cursor: default;
          background: #f8f9fa;
        }

        .calendar-date.date-available {
          background: white;
          color: #212529;
        }

        .calendar-date.date-available:hover {
          background: #e3f2fd;
          color: #1976d2;
        }

        .calendar-date.date-selected {
          background: #1976d2;
          color: white;
        }

        .calendar-date.date-in-range {
          background: #e3f2fd;
          color: #1976d2;
        }

        .calendar-date.date-reserved {
          background: #ffecb3;
          color: #f57c00;
          cursor: not-allowed;
        }

        .calendar-date.date-past {
          background: #f5f5f5;
          color: #9e9e9e;
          cursor: not-allowed;
        }

        .date-number {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .reservation-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          font-size: 6px;
          color: #f57c00;
        }

        .calendar-legend {
          border-top: 1px solid #e9ecef;
          padding-top: 15px;
        }

        .legend-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          display: inline-block;
        }

        .legend-color.date-available {
          background: white;
          border: 2px solid #dee2e6;
        }

        .legend-color.date-selected {
          background: #1976d2;
        }

        .legend-color.date-reserved {
          background: #ffecb3;
          border: 1px solid #f57c00;
        }

        .legend-color.date-past {
          background: #f5f5f5;
        }

        @media (max-width: 576px) {
          .calendar-date {
            height: 40px;
            font-size: 0.8rem;
          }
          
          .calendar-header-cell {
            font-size: 0.75rem;
            padding: 8px 3px;
          }
        }
      `}</style>
    </div>
  );
}

export default AvailabilityCalendar;