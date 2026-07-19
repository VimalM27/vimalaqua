import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import '../styles/dashboard.css';

const categories = ['Academic', 'Infrastructure', 'Hostel', 'Finance', 'General'];
const departments = ['Facilities', 'Library', 'Hostel Admin', 'Accounts', 'Academic Office'];

export default function RaiseComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', category: categories[0], department: departments[0], description: '', image: null,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Wire this up to POST /api/complaints once the backend exists
    setSubmitted(true);
    setTimeout(() => navigate('/complaint-status'), 900);
  };

  return (
    <AppShell role="student" title="Raise a complaint" subtitle="Give the department enough detail to act on it right away.">
      <section className="panel" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="title">Complaint Title</label>
            <input id="title" name="title" type="text" placeholder="e.g. Hostel Wi-Fi down" value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="department">Department</label>
            <select id="department" name="department" value={form.department} onChange={handleChange}>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows="5" placeholder="What happened, and since when?" value={form.description} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label htmlFor="image">Upload Image</label>
            <input id="image" name="image" type="file" accept="image/*" onChange={handleChange} />
          </div>

          <button type="submit" className="btn-primary">{submitted ? 'Submitted \u2713' : 'Submit'}</button>
        </form>
      </section>
    </AppShell>
  );
}
