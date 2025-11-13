import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import EquipmentList from './pages/EquipmentList';
import NewRequest from './pages/NewRequest';
import RequestsList from './pages/RequestsList';
import AdminPanel from './pages/AdminPanel';
import HelpCenter from './pages/HelpCenter';
import ContactSupport from './pages/ContactSupport';
import FAQ from './pages/FAQ';
import UsageGuidelines from './pages/UsageGuidelines';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const PrivateRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }) => {
    return user && (user.role === 'admin' || user.role === 'staff') 
      ? children 
      : <Navigate to="/equipment" />;
  };

  return (
    <Router>
      <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar user={user} setUser={setUser} />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={!user ? <Home /> : <Navigate to="/equipment" />} />
            <Route path="/login" element={user ? <Navigate to="/equipment" /> : <Login setUser={setUser} />} />
            <Route path="/register" element={user ? <Navigate to="/equipment" /> : <Register setUser={setUser} />} />
            <Route path="/forgot-password" element={user ? <Navigate to="/equipment" /> : <ForgotPassword />} />
            <Route path="/verify-otp" element={user ? <Navigate to="/equipment" /> : <VerifyOTP />} />
            <Route path="/reset-password/:token" element={user ? <Navigate to="/equipment" /> : <ResetPassword setUser={setUser} />} />
            <Route path="/equipment" element={<EquipmentList user={user} />} />
            <Route path="/request/new" element={<PrivateRoute><NewRequest /></PrivateRoute>} />
            <Route path="/requests" element={<PrivateRoute><RequestsList user={user} /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPanel user={user} /></AdminRoute>} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/guidelines" element={<UsageGuidelines />} />
            <Route path="/contact" element={<ContactSupport />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    </Router>
  );
}

export default App;
