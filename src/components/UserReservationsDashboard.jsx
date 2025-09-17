import React, { useState, useEffect } from 'react';

const UserReservationsDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations/user', {
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
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await fetch(`/api/reservations/${id}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchReservations(); // Refresh list
      } catch (error) {
        console.error('Failed to cancel reservation:', error);
      }
    }
  };

  if (loading) return &lt;div className="p-4"&gt;Loading reservations...&lt;/div&gt;;

  return (
    &lt;div className="p-6"&gt;
      &lt;h1 className="text-2xl font-bold mb-6"&gt;My Reservations&lt;/h1&gt;
      
      {reservations.length === 0 ? (
        &lt;p className="text-gray-500"&gt;No reservations found.&lt;/p&gt;
      ) : (
        &lt;div className="space-y-4"&gt;
          {reservations.map((reservation) => (
            &lt;div key={reservation._id} className="border rounded-lg p-4 bg-white shadow"&gt;
              &lt;div className="flex justify-between items-start"&gt;
                &lt;div&gt;
                  &lt;h3 className="font-semibold text-lg"&gt;{reservation.equipment?.name}&lt;/h3&gt;
                  &lt;p className="text-gray-600"&gt;
                    {new Date(reservation.startDate).toLocaleDateString()} - 
                    {new Date(reservation.endDate).toLocaleDateString()}
                  &lt;/p&gt;
                  &lt;p className="text-sm text-gray-500"&gt;Status: {reservation.status}&lt;/p&gt;
                &lt;/div&gt;
                {reservation.status === 'confirmed' && (
                  &lt;button
                    onClick={() => cancelReservation(reservation._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  &gt;
                    Cancel
                  &lt;/button&gt;
                )}
              &lt;/div&gt;
            &lt;/div&gt;
          ))}
        &lt;/div&gt;
      )}
    &lt;/div&gt;
  );
};

export default UserReservationsDashboard;