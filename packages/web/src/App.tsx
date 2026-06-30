import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated } from './lib/api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Resellers from './pages/Resellers';
import Giveaways from './pages/Giveaways';
import ServerBuilder from './pages/ServerBuilder';
import Logs from './pages/Logs';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [auth, setAuth] = useState(isAuthenticated());

  useEffect(() => {
    const handleStorage = () => setAuth(isAuthenticated());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={auth ? <Navigate to="/" replace /> : <Login onLogin={() => setAuth(true)} />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout onLogout={() => { setAuth(false); }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/resellers" element={<Resellers />} />
                  <Route path="/giveaways" element={<Giveaways />} />
                  <Route path="/server" element={<ServerBuilder />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
