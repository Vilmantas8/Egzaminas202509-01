// MAIN ENTRY POINT FOR REACT APP
// This file renders our App component into the HTML page
// This is standard React setup - beginner friendly

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Get the root element from public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render our App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
