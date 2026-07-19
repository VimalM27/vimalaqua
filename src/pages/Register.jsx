import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    // Wire this up to POST /api/auth/register once the backend exists
    navigate('/dashboard');
  };

  return (
    <AuthLayout title="Create your account" subtitle="Set up your student profile in under a minute.">
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" placeholder="Full name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="you@campus.edu" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required />
        </div>
        {error && <p style={{ color: 'var(--coral)', fontSize: 13.5, marginTop: -6, marginBottom: 14 }}>{error}</p>}
        <button type="submit" className="btn-primary">Register</button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/" className="btn-link">Login</Link>
      </p>
    </AuthLayout>
  );
}
