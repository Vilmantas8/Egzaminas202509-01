import React, { useState, useEffect } from 'react';

const AdminReservationsDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations/admin', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/api/reservations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      fetchReservations();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const filteredReservations = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);

  return (
    &lt;div className="p-6"&gt;
      &lt;h1 className="text-2xl font-bold mb-6"&gt;Admin - All Reservations&lt;/h1&gt;
      
      &lt;div className="mb-4"&gt;
        &lt;select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-2 border rounded"&gt;
          &lt;option value="all"&gt;All Status&lt;/option&gt;
          &lt;option value="pending"&gt;Pending&lt;/option&gt;
          &lt;option value="confirmed"&gt;Confirmed&lt;/option&gt;
          &lt;option value="cancelled"&gt;Cancelled&lt;/option&gt;
        &lt;/select&gt;
      &lt;/div&gt;

      &lt;div className="grid gap-4"&gt;
        {filteredReservations.map((reservation) => (
          &lt;div key={reservation._id} className="border rounded-lg p-4 bg-white shadow"&gt;
            &lt;div className="flex justify-between items-start"&gt;
              &lt;div&gt;
                &lt;h3 className="font-semibold"&gt;{reservation.equipment?.name}&lt;/h3&gt;
                &lt;p&gt;Customer: {reservation.user?.firstName} {reservation.user?.lastName}&lt;/p&gt;
                &lt;p&gt;Dates: {new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}&lt;/p&gt;
                &lt;p&gt;Status: {reservation.status}&lt;/p&gt;
              &lt;/div&gt;
              {reservation.status === 'pending' && (
                &lt;div className="space-x-2"&gt;
                  &lt;button onClick={() => updateStatus(reservation._id, 'confirmed')} className="bg-green-500 text-white px-3 py-1 rounded"&gt;
                    Approve
                  &lt;/button&gt;
                  &lt;button onClick={() => updateStatus(reservation._id, 'cancelled')} className="bg-red-500 text-white px-3 py-1 rounded"&gt;
                    Reject
                  &lt;/button&gt;
                &lt;/div&gt;
              )}
            &lt;/div&gt;
          &lt;/div&gt;
        ))}
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default AdminReservationsDashboard;