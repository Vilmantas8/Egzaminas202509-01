import React, { useState, useEffect } from 'react';

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment');
      if (response.ok) {
        const data = await response.json();
        setEquipment(data);
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'available' && item.status === 'available') ||
                         (filter === 'rented' && item.status === 'rented') ||
                         (filter === 'maintenance' && item.status === 'maintenance');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      &lt;div className="flex justify-center items-center min-h-64"&gt;
        &lt;div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"&gt;&lt;/div&gt;
      &lt;/div&gt;
    );
  }
  return (
    &lt;div className="p-6"&gt;
      &lt;div className="mb-6"&gt;
        &lt;h1 className="text-3xl font-bold text-gray-900 mb-4"&gt;Equipment Catalog&lt;/h1&gt;
        
        {/* Search and Filter Controls */}
        &lt;div className="flex flex-col sm:flex-row gap-4 mb-6"&gt;
          &lt;div className="flex-1"&gt;
            &lt;input
              type="text"
              placeholder="Search equipment..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            /&gt;
          &lt;/div&gt;
          &lt;div&gt;
            &lt;select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            &gt;
              &lt;option value="all"&gt;All Equipment&lt;/option&gt;
              &lt;option value="available"&gt;Available&lt;/option&gt;
              &lt;option value="rented"&gt;Rented&lt;/option&gt;
              &lt;option value="maintenance"&gt;Under Maintenance&lt;/option&gt;
            &lt;/select&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {/* Equipment Grid */}
      &lt;div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"&gt;
        {filteredEquipment.map((item) => (
          &lt;div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"&gt;
            &lt;div className="h-48 bg-gray-200 flex items-center justify-center"&gt;
              {item.image ? (
                &lt;img src={item.image} alt={item.name} className="w-full h-full object-cover" /&gt;
              ) : (
                &lt;div className="text-gray-400"&gt;No Image&lt;/div&gt;
              )}
            &lt;/div&gt;
            
            &lt;div className="p-4"&gt;
              &lt;h3 className="font-bold text-lg mb-2"&gt;{item.name}&lt;/h3&gt;
              &lt;p className="text-gray-600 text-sm mb-2"&gt;{item.category}&lt;/p&gt;
              &lt;p className="text-gray-700 text-sm mb-3 line-clamp-2"&gt;{item.description}&lt;/p&gt;
              
              &lt;div className="flex justify-between items-center mb-3"&gt;
                &lt;span className="font-bold text-lg text-blue-600"&gt;${item.pricePerDay}/day&lt;/span&gt;
                &lt;span className={`px-2 py-1 rounded-full text-xs font-medium ${{
                  available: 'bg-green-100 text-green-800',
                  rented: 'bg-red-100 text-red-800',
                  maintenance: 'bg-yellow-100 text-yellow-800'
                }[item.status]}`}&gt;
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                &lt;/span&gt;
              &lt;/div&gt;
              
              &lt;button
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  item.status === 'available'
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={item.status !== 'available'}
              &gt;
                {item.status === 'available' ? 'View Details' : 'Unavailable'}
              &lt;/button&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        ))}
      &lt;/div&gt;

      {filteredEquipment.length === 0 && (
        &lt;div className="text-center py-12"&gt;
          &lt;p className="text-gray-500 text-lg"&gt;No equipment found matching your criteria.&lt;/p&gt;
        &lt;/div&gt;
      )}
    &lt;/div&gt;
  );
};

export default EquipmentList;