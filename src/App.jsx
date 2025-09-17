import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';

// Placeholder components - these would be created in their respective feature branches
const Dashboard = () => &lt;div className="p-4"&gt;&lt;h1&gt;User Dashboard&lt;/h1&gt;&lt;/div&gt;;
const AdminDashboard = () => &lt;div className="p-4"&gt;&lt;h1&gt;Admin Dashboard&lt;/h1&gt;&lt;/div&gt;;
const EquipmentList = () => &lt;div className="p-4"&gt;&lt;h1&gt;Equipment List&lt;/h1&gt;&lt;/div&gt;;
const ReservationsList = () => &lt;div className="p-4"&gt;&lt;h1&gt;My Reservations&lt;/h1&gt;&lt;/div&gt;;

const App = () => {
  return (
    &lt;AuthProvider&gt;
      &lt;Router&gt;
        &lt;div className="min-h-screen bg-gray-100"&gt;
          &lt;Routes&gt;
            {/* Public routes */}
            &lt;Route path="/login" element={&lt;LoginForm /&gt;} /&gt;
            &lt;Route path="/register" element={&lt;RegistrationForm /&gt;} /&gt;
            
            {/* Protected user routes */}
            &lt;Route path="/dashboard" element={
              &lt;ProtectedRoute&gt;
                &lt;Dashboard /&gt;
              &lt;/ProtectedRoute&gt;
            } /&gt;
            
            &lt;Route path="/equipment" element={
              &lt;ProtectedRoute&gt;
                &lt;EquipmentList /&gt;
              &lt;/ProtectedRoute&gt;
            } /&gt;
            
            &lt;Route path="/reservations" element={
              &lt;ProtectedRoute&gt;
                &lt;ReservationsList /&gt;
              &lt;/ProtectedRoute&gt;
            } /&gt;
            
            {/* Protected admin routes */}
            &lt;Route path="/admin" element={
              &lt;ProtectedRoute adminOnly={true}&gt;
                &lt;AdminDashboard /&gt;
              &lt;/ProtectedRoute&gt;
            } /&gt;
            
            {/* Default redirect */}
            &lt;Route path="/" element={&lt;Navigate to="/dashboard" replace /&gt;} /&gt;
            
            {/* Unauthorized page */}
            &lt;Route path="/unauthorized" element={
              &lt;div className="min-h-screen flex items-center justify-center"&gt;
                &lt;div className="text-center"&gt;
                  &lt;h1 className="text-2xl font-bold text-red-600"&gt;Unauthorized&lt;/h1&gt;
                  &lt;p className="mt-2 text-gray-600"&gt;You don't have permission to access this page.&lt;/p&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            } /&gt;
          &lt;/Routes&gt;
        &lt;/div&gt;
      &lt;/Router&gt;
    &lt;/AuthProvider&gt;
  );
};

export default App;