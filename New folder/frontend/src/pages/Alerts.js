import React from 'react';
import { useNavigate } from 'react-router-dom';

const Alerts = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>FeeAlert</h1>
        <nav>
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/alerts">Alerts</a></li>
            <li><a href="/settings">Settings</a></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </ul>
        </nav>
      </header>
      <main className="App-main">
        <div>
          <h2>Fee Alerts</h2>
          <p>Manage your fee alerts and notifications here.</p>
          {/* Alert management functionality will be added here */}
        </div>
      </main>
      <footer className="App-footer">
        <p>© 2024 FeeAlert - Monitor fees efficiently</p>
      </footer>
    </div>
  );
};

export default Alerts;