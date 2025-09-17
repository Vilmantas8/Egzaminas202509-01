import React, { useState, useEffect } from 'react';

const AdminEquipmentForm = ({ equipmentId = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    pricePerDay: '',
    status: 'available',
    specifications: {},
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (equipmentId) {
      setIsEdit(true);
      fetchEquipment();
    }
  }, [equipmentId]);

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`/api/equipment/${equipmentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit ? `/api/equipment/${equipmentId}` : '/api/equipment';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess && onSuccess();
        onClose && onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save equipment');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  return (
    &lt;div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"&gt;
      &lt;div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"&gt;
        &lt;div className="flex justify-between items-center mb-6"&gt;
          &lt;h2 className="text-2xl font-bold"&gt;{isEdit ? 'Edit Equipment' : 'Add New Equipment'}&lt;/h2&gt;
          &lt;button onClick={onClose} className="text-gray-500 hover:text-gray-700"&gt;
            ✕
          &lt;/button&gt;
        &lt;/div&gt;

        &lt;form onSubmit={handleSubmit} className="space-y-4"&gt;
          &lt;div&gt;
            &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;Equipment Name&lt;/label&gt;
            &lt;input
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={handleChange}
            /&gt;
          &lt;/div&gt;

          &lt;div&gt;
            &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;Category&lt;/label&gt;
            &lt;select
              name="category"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.category}
              onChange={handleChange}
            &gt;
              &lt;option value=""&gt;Select Category&lt;/option&gt;
              &lt;option value="Excavators"&gt;Excavators&lt;/option&gt;
              &lt;option value="Cranes"&gt;Cranes&lt;/option&gt;
              &lt;option value="Bulldozers"&gt;Bulldozers&lt;/option&gt;
              &lt;option value="Compactors"&gt;Compactors&lt;/option&gt;
              &lt;option value="Generators"&gt;Generators&lt;/option&gt;
              &lt;option value="Tools"&gt;Tools&lt;/option&gt;
            &lt;/select&gt;
          &lt;/div&gt;

          &lt;div&gt;
            &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;Description&lt;/label&gt;
            &lt;textarea
              name="description"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={handleChange}
            &gt;&lt;/textarea&gt;
          &lt;/div&gt;

          &lt;div className="grid grid-cols-2 gap-4"&gt;
            &lt;div&gt;
              &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;Price per Day ($)&lt;/label&gt;
              &lt;input
                type="number"
                name="pricePerDay"
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.pricePerDay}
                onChange={handleChange}
              /&gt;
            &lt;/div&gt;

            &lt;div&gt;
              &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;Status&lt;/label&gt;
              &lt;select
                name="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={handleChange}
              &gt;
                &lt;option value="available"&gt;Available&lt;/option&gt;
                &lt;option value="rented"&gt;Rented&lt;/option&gt;
                &lt;option value="maintenance"&gt;Under Maintenance&lt;/option&gt;
              &lt;/select&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;div&gt;
            &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;Image URL&lt;/label&gt;
            &lt;input
              type="url"
              name="image"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.image}
              onChange={handleChange}
            /&gt;
          &lt;/div&gt;

          &lt;div className="flex justify-end space-x-3 pt-4"&gt;
            &lt;button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            &gt;
              Cancel
            &lt;/button&gt;
            &lt;button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            &gt;
              {loading ? 'Saving...' : (isEdit ? 'Update Equipment' : 'Add Equipment')}
            &lt;/button&gt;
          &lt;/div&gt;
        &lt;/form&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default AdminEquipmentForm;