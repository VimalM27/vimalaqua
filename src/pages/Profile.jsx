import { useState } from 'react';
import AppShell from '../components/AppShell';
import { currentStudent } from '../services/mockData';
import '../styles/dashboard.css';

export default function Profile() {
  const [form, setForm] = useState(currentStudent);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Wire this up to PUT /api/profile once the backend exists
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell role="student" title="My profile" subtitle="Keep your details current so updates reach you.">
      <section className="panel" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="department">Department</label>
            <input id="department" name="department" type="text" value={form.department} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="semester">Semester</label>
            <input id="semester" name="semester" type="text" value={form.semester} onChange={handleChange} />
          </div>
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '11px 22px' }}>
            {saved ? 'Saved \u2713' : 'Save changes'}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
