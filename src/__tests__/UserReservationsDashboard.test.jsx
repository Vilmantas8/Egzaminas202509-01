import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import UserReservationsDashboard from '../components/UserReservationsDashboard';

// Mock fetch globally
global.fetch = vi.fn();

describe('UserReservationsDashboard', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders reservation dashboard title', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(&lt;UserReservationsDashboard /&gt;);
    expect(screen.getByText('My Reservations')).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    
    render(&lt;UserReservationsDashboard /&gt;);
    expect(screen.getByText('Loading reservations...')).toBeInTheDocument();
  });

  test('displays reservations when loaded', async () => {
    const mockReservations = [
      {
        _id: '1',
        equipment: { name: 'Test Equipment' },
        startDate: '2025-01-01',
        endDate: '2025-01-05',
        status: 'confirmed'
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockReservations
    });

    render(&lt;UserReservationsDashboard /&gt;);
    
    // Wait for async loading to complete
    await screen.findByText('Test Equipment');
    expect(screen.getByText('Status: confirmed')).toBeInTheDocument();
  });

  test('handles cancel reservation', async () => {
    const mockReservations = [
      {
        _id: '1',
        equipment: { name: 'Test Equipment' },
        startDate: '2025-01-01',
        endDate: '2025-01-05',
        status: 'confirmed'
      }
    ];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockReservations
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

    window.confirm = vi.fn(() => true);

    render(&lt;UserReservationsDashboard /&gt;);
    
    await screen.findByText('Test Equipment');
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(fetch).toHaveBeenCalledWith('/api/reservations/1/cancel', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  });
});