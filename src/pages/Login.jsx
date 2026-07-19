import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Wire this up to POST /api/auth/login once the backend exists
    navigate('/dashboard');
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to raise or track a complaint.">
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="you@campus.edu" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn-primary">Login</button>
      </form>
      <p className="auth-switch">
        New here? <Link to="/register" className="btn-link">Register</Link>
      </p>
    </AuthLayout>
  );
}
