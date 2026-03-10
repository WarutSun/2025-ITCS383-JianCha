import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Cars from './pages/Cars'
import Bookings from './pages/Bookings'
import Profile from './pages/Profile'
import PaymentSimulation from './pages/PaymentSimulation'
import Dashboard from './pages/Staff/Dashboard'
import Reports from './pages/Staff/Reports'
import CarManagement from './pages/Staff/CarManagement'
import { getUserRole } from './lib/auth'
import { Navigate } from 'react-router-dom'

const StaffRoute = ({ children }) => {
  const role = getUserRole();
  return role === 'staff' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <>
      <Navbar />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/payment" element={<PaymentSimulation />} />
        <Route
          path="/staff"
          element={<StaffRoute><Dashboard /></StaffRoute>}
        />
        <Route
          path="/staff/reports"
          element={<StaffRoute><Reports /></StaffRoute>}
        />
        <Route
          path="/staff/cars"
          element={<StaffRoute><CarManagement /></StaffRoute>}
        />
      </Routes>
    </>
  )
}

export default App

