import React, { useState } from 'react';
import './App.css';
import IPScanner from './components/IPScanner';

function App() {
  return (
    <div className="app">
      <div className="container">
        <header>
          <h1><span className="shield-icon">🛡️</span> CAUGHTYOU SOC</h1>
          <p className="subtitle">Defensive Security Intelligence Platform</p>
        </header>
        <IPScanner />
      </div>
    </div>
  );
}

export default App;
