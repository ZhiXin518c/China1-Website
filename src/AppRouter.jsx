import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminMenu from './pages/AdminMenu';

const AppRouter = () => {
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('china1_admin');
    if (savedAdmin) {
      setAdminUser(JSON.parse(savedAdmin));
    }
  }, []);

  const handleAdminLogin = (user) => {
    setAdminUser(user);
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('china1_admin');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route
          path="/admin"
          element={
            adminUser ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <AdminLogin onLogin={handleAdminLogin} />
            )
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            adminUser ? (
              <AdminDashboard adminUser={adminUser} onLogout={handleAdminLogout} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />

        <Route
          path="/admin/orders"
          element={
            adminUser ? (
              <AdminOrders adminUser={adminUser} onLogout={handleAdminLogout} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />

        <Route
          path="/admin/menu"
          element={
            adminUser ? (
              <AdminMenu adminUser={adminUser} onLogout={handleAdminLogout} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
