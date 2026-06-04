import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './index.css';

// Import des pages
import Dashboard from './pages/Dashboard';
import Simulateur from './pages/Simulateur';
import Sante from './pages/Sante';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="text-3xl group-hover:scale-110 transition-transform duration-300">🌍</div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl font-display">RESPIRE</span>
                <span className="text-blue-100 text-xs">Air Quality Monitor</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex space-x-2">
              <NavLink 
                to="/" 
                active={isActive('/')}
                icon="🏠"
                label="Tableau de bord"
              />
              <NavLink 
                to="/sante" 
                active={isActive('/sante')}
                icon="🏥"
                label="Observatoire"
              />
              <NavLink 
                to="/simulateur" 
                active={isActive('/simulateur')}
                icon="⚙️"
                label="Simulateur"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sante" element={<Sante />} />
        <Route path="/simulateur" element={<Simulateur />} />
      </Routes>
    </div>
  );
}

function NavLink({ to, active, icon, label }) {
  return (
    <Link 
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
        active 
          ? 'bg-white/20 text-white' 
          : 'text-blue-100 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
      {active && <div className="hidden sm:block w-2 h-2 bg-white rounded-full animate-pulse"></div>}
    </Link>
  );
}

export default App;