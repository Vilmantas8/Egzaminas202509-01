import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchEquipmentDetails();
  }, [id]);

  const fetchEquipmentDetails = async () => {
    try {
      const response = await fetch(`/api/equipment/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEquipment(data);
      }
    } catch (error) {
      console.error('Failed to fetch equipment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          equipmentId: equipment._id,
          startDate: selectedDates.startDate,
          endDate: selectedDates.endDate
        })
      });

      if (response.ok) {
        alert('Reservation created successfully!');
        navigate('/reservations');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create reservation');
      }
    } catch (error) {
      console.error('Reservation failed:', error);
      alert('Failed to create reservation');
    }
  };

  if (loading) {
    return (
      &lt;div className="flex justify-center items-center min-h-64"&gt;
        &lt;div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"&gt;&lt;/div&gt;
      &lt;/div&gt;
    );
  }

  if (!equipment) {
    return (
      &lt;div className="text-center py-12"&gt;
        &lt;p className="text-gray-500 text-lg"&gt;Equipment not found.&lt;/p&gt;
      &lt;/div&gt;
    );
  }
  return (
    &lt;div className="max-w-6xl mx-auto p-6"&gt;
      &lt;button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
      &gt;
        ← Back to Equipment
      &lt;/button&gt;

      &lt;div className="grid grid-cols-1 lg:grid-cols-2 gap-8"&gt;
        {/* Equipment Image */}
        &lt;div className="space-y-4"&gt;
          &lt;div className="aspect-square bg-gray-200 rounded-lg overflow-hidden"&gt;
            {equipment.image ? (
              &lt;img src={equipment.image} alt={equipment.name} className="w-full h-full object-cover" /&gt;
            ) : (
              &lt;div className="flex items-center justify-center h-full text-gray-400"&gt;No Image Available&lt;/div&gt;
            )}
          &lt;/div&gt;
          
          {equipment.gallery && equipment.gallery.length > 0 && (
            &lt;div className="grid grid-cols-4 gap-2"&gt;
              {equipment.gallery.map((img, index) => (
                &lt;img key={index} src={img} alt={`${equipment.name} ${index + 1}`} className="aspect-square object-cover rounded-lg" /&gt;
              ))}
            &lt;/div&gt;
          )}
        &lt;/div&gt;

        {/* Equipment Details */}
        &lt;div className="space-y-6"&gt;
          &lt;div&gt;
            &lt;h1 className="text-3xl font-bold text-gray-900 mb-2"&gt;{equipment.name}&lt;/h1&gt;
            &lt;p className="text-gray-600 text-lg"&gt;{equipment.category}&lt;/p&gt;
          &lt;/div&gt;

          &lt;div className="flex items-center space-x-4"&gt;
            &lt;span className="text-2xl font-bold text-blue-600"&gt;${equipment.pricePerDay}/day&lt;/span&gt;
            &lt;span className={`px-3 py-1 rounded-full text-sm font-medium ${{
              available: 'bg-green-100 text-green-800',
              rented: 'bg-red-100 text-red-800',
              maintenance: 'bg-yellow-100 text-yellow-800'
            }[equipment.status]}`}&gt;
              {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
            &lt;/span&gt;
          &lt;/div&gt;

          &lt;div&gt;
            &lt;h3 className="text-lg font-semibold mb-2"&gt;Description&lt;/h3&gt;
            &lt;p className="text-gray-700"&gt;{equipment.description}&lt;/p&gt;
          &lt;/div&gt;

          {equipment.specifications && (
            &lt;div&gt;
              &lt;h3 className="text-lg font-semibold mb-2"&gt;Specifications&lt;/h3&gt;
              &lt;ul className="space-y-1 text-gray-700"&gt;
                {Object.entries(equipment.specifications).map(([key, value]) => (
                  &lt;li key={key} className="flex"&gt;
                    &lt;span className="font-medium w-32"&gt;{key}:&lt;/span&gt;
                    &lt;span&gt;{value}&lt;/span&gt;
                  &lt;/li&gt;
                ))}
              &lt;/ul&gt;
            &lt;/div&gt;
          )}

          {/* Reservation Form */}
          {equipment.status === 'available' && (
            &lt;div className="border-t pt-6"&gt;
              &lt;h3 className="text-lg font-semibold mb-4"&gt;Make a Reservation&lt;/h3&gt;
              &lt;div className="space-y-4"&gt;
                &lt;div className="grid grid-cols-2 gap-4"&gt;
                  &lt;div&gt;
                    &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;Start Date&lt;/label&gt;
                    &lt;input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedDates.startDate}
                      onChange={(e) => setSelectedDates({...selectedDates, startDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    /&gt;
                  &lt;/div&gt;
                  &lt;div&gt;
                    &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;End Date&lt;/label&gt;
                    &lt;input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedDates.endDate}
                      onChange={(e) => setSelectedDates({...selectedDates, endDate: e.target.value})}
                      min={selectedDates.startDate || new Date().toISOString().split('T')[0]}
                    /&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
                
                &lt;button
                  onClick={handleReservation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                &gt;
                  Reserve Equipment
                &lt;/button&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          )}
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default EquipmentDetails;