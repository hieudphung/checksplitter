import React, { useState } from 'react';
import './App.css';
import BillSplitter from './components/BillSplitter';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <button className="dark-mode-toggle" onClick={toggleDarkMode}>{darkMode ? '☀️' : '🌙'}</button>
  
      <h1> </h1>
      <div className="container">
        <div className="bubble">
          <BillSplitter />
        </div>
      </div>
    </div>
  );
}

export default App;
