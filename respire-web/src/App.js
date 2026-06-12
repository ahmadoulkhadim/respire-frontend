import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, HeartPulse, Settings, Menu, X, Wind, ChevronRight } from 'lucide-react';
import './index.css';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/sante', icon: HeartPulse, label: 'Observatoire' },
    { to: '/simulateur', icon: Settings, label: 'Simulateur' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <nav className="fixed top-0 left-0 right-0 z-50 hero-banner shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
                <img
                  src="/logo.png"
                  alt="RESPIRE"
                  className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl font-display">RESPIRE</span>
                <span className="text-blue-100 text-xs">Qualité de l'air · Cap-Vert</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  active={isActive(item.to)}
                  icon={item.icon}
                />
              ))}
              <div className="w-px h-6 bg-white/20 mx-2" />
              <a
                href="http://localhost:8501"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-200 hover:text-white hover:bg-white/10 transition-all"
              >
                <Wind className="w-4 h-4" />
                IA
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-respire-700"
            >
              <div className="px-4 py-4 space-y-1">
                {navItems.map((item) => (
                  <MobileNavLink
                    key={item.to}
                    to={item.to}
                    active={isActive(item.to)}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                ))}
                <hr className="my-2 border-white/10" />
                <a
                  href="http://localhost:8501"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 font-medium"
                >
                  <Wind className="w-5 h-5" />
                  Dashboard IA
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sante" element={<Sante />} />
          <Route path="/simulateur" element={<Simulateur />} />
        </Routes>
      </main>
    </div>
  );
}

function NavLink({ to, active, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-white/20 text-white'
          : 'text-blue-100 hover:text-white hover:bg-white/10'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {active && (
        <motion.div layoutId="nav-indicator" className="w-1.5 h-1.5 rounded-full bg-white" />
      )}
    </Link>
  );
}

function MobileNavLink({ to, active, icon: Icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
        active ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {active && <div className="w-1.5 h-1.5 rounded-full bg-white ml-auto" />}
    </Link>
  );
}

export default App;