// src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import WebNavigation from './navigations/WebNavigation';

function App() {
  return (
    <Router>
      <WebNavigation />
    </Router>
  );
}

export default App;