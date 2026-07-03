import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Sante from './pages/Sante';
import Simulateur from './pages/Simulateur';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <Layout>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/sante"
            element={
              <Layout>
                <ProtectedRoute>
                  <Sante />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/simulateur"
            element={
              <Layout>
                <ProtectedRoute>
                  <Simulateur />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
