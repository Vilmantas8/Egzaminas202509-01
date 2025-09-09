import React, { useState } from 'react';
import { Search, Filter, Calendar, Wrench, Leaf, Gauge, 
         Eye, Edit, Plus, Trash2, Truck, Shield, MapPin, 
         Battery, Fuel, Users, LogIn, Settings } from 'lucide-react';

// Demo data
const equipmentData = [
  {
    id: "kt-100",
    name: "Krautuvas CAT 3000kg",
    image: "https://images.unsplash.com/photo-1614854262340-9f4e0f1cab19?q=80&w=600&auto=format&fit=crop",
    power: "diesel",
    capacity: "3000kg",
    price: "€85/diena",
    status: "available",
    location: "Kaunas"
  },
  {
    id: "bm-200", 
    name: "Betonmaišė Liebherr 350L",
    image: "https://images.unsplash.com/photo-1620138549836-0d17826dfec2?q=80&w=600&auto=format&fit=crop", 
    power: "electric",
    capacity: "350L",
    price: "€45/diena",
    status: "available",
    location: "Vilnius"
  },
  {
    id: "gen-80",
    name: "Generatorius 8kW Honda",
    image: "https://images.unsplash.com/photo-1563227311-e1b613b31427?q=80&w=600&auto=format&fit=crop",
    power: "petrol", 
    capacity: "8kW",
    price: "€35/diena",
    status: "rented",
    location: "Klaipėda"
  }
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const filteredEquipment = equipmentData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <FilterPanel searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </aside>
          
          <section className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Inventorius ({filteredEquipment.length})</h2>
              {isAdmin && (
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nauja įranga
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEquipment.map(item => (
                <EquipmentCard 
                  key={item.id} 
                  equipment={item} 
                  isAdmin={isAdmin}
                  onView={() => setSelectedEquipment(item)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
      
      {selectedEquipment && (
        <EquipmentModal 
          equipment={selectedEquipment}
          isAdmin={isAdmin}
          onClose={() => setSelectedEquipment(null)}
        />
      )}
    </div>
  );
}

function Header({ isAdmin, setIsAdmin }) {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
            ST
          </div>
          <div>
            <h1 className="font-semibold">Statybinės technikos nuoma</h1>
            <p className="text-xs text-gray-500">Profesionali statyba</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAdmin(!isAdmin)}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg"
          >
            <Users className="w-4 h-4" />
            {isAdmin ? 'Admin' : 'Vartotojas'}
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 text-blue-600">
            <LogIn className="w-4 h-4" />
            Prisijungti
          </button>
        </div>
      </div>
    </header>
  );
}

function FilterPanel({ searchQuery, setSearchQuery }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="flex items-center gap-2 font-semibold mb-4">
        <Filter className="w-4 h-4" />
        Filtrai
      </h3>
      
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Paieška pagal pavadinimą"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Tipas</label>
          <select className="w-full p-2 border rounded-lg">
            <option>Visi tipai</option>
            <option>Krautuvai</option>
            <option>Betonmaišės</option>
            <option>Generatoriai</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Kaina</label>
          <select className="w-full p-2 border rounded-lg">
            <option>Visi</option>
            <option>€20-40</option>
            <option>€40-60</option>
            <option>€60+</option>
          </select>
        </div>
      </div>
    </div>
  );
}function EquipmentCard({ equipment, isAdmin, onView }) {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    rented: 'bg-yellow-100 text-yellow-800', 
    maintenance: 'bg-red-100 text-red-800'
  };
  
  const statusLabels = {
    available: 'Laisva',
    rented: 'Išnuomota',
    maintenance: 'Servisas'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="relative">
        <img 
          src={equipment.image} 
          alt={equipment.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[equipment.status]}`}>
            {statusLabels[equipment.status]}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 bg-white px-2 py-1 rounded text-sm font-semibold">
          {equipment.price}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{equipment.name}</h3>
        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            {equipment.power === 'diesel' ? <Fuel className="w-3 h-3" /> : <Battery className="w-3 h-3" />}
            {equipment.power === 'diesel' ? 'Dyzelis' : equipment.power === 'electric' ? 'Elektra' : 'Benzinas'}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            {equipment.capacity}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {equipment.location}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <button 
            onClick={onView}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
            Peržiūrėti
          </button>
          
          {isAdmin ? (
            <div className="flex gap-2">
              <button className="p-2 border rounded-lg hover:bg-gray-50">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
              <Truck className="w-4 h-4" />
              Rezervuoti
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EquipmentModal({ equipment, isAdmin, onClose }) {
  if (!equipment) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Wrench className="w-6 h-6" />
              {equipment.name}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <img 
              src={equipment.image}
              alt={equipment.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-gray-600">Galia</div>
                <div className="font-medium">{equipment.power === 'diesel' ? 'Dyzelis' : equipment.power === 'electric' ? 'Elektra' : 'Benzinas'}</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-gray-600">Talpa/Galia</div>
                <div className="font-medium">{equipment.capacity}</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-gray-600">Lokacija</div>
                <div className="font-medium">{equipment.location}</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-gray-600">Kaina</div>
                <div className="font-medium">{equipment.price}</div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Rezervacija
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Data nuo</label>
                  <input type="date" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data iki</label>
                  <input type="date" className="w-full p-2 border rounded" />
                </div>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                  Rezervuoti
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Būsena
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Techninė apžiūra</span>
                  <span className="text-green-600 font-medium">Tvarkinga</span>
                </div>
                <div className="flex justify-between">
                  <span>Artimiausias laisvas</span>
                  <span className="font-medium">Šiandien</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            © 2024 Statybinės technikos nuoma • React + Tailwind
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-gray-100 text-xs rounded">React</span>
            <span className="px-2 py-1 bg-gray-100 text-xs rounded">Tailwind</span>
            <span className="px-2 py-1 bg-gray-100 text-xs rounded">MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default App;