import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import RaiseComplaint from './pages/RaiseComplaint';
import ComplaintStatus from './pages/ComplaintStatus';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import './styles/theme.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/raise-complaint" element={<RaiseComplaint />} />
      <Route path="/complaint-status" element={<ComplaintStatus />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
