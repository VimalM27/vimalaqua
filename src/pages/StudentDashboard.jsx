import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import StatusBadge from '../components/StatusBadge';
import { currentStudent, complaints } from '../services/mockData';
import '../styles/dashboard.css';

const cards = [
  { to: '/raise-complaint', title: 'Raise Complaint', copy: 'Log a new issue for a department to act on.', accent: 'amber' },
  { to: '/complaint-status', title: 'Complaint Status', copy: 'Check progress on everything you\u2019ve raised.', accent: 'ink2' },
  { to: '/complaint-status', title: 'Notifications', copy: '2 updates on your open complaints.', accent: 'coral' },
  { to: '/profile', title: 'My Profile', copy: 'Update your contact and department details.', accent: 'sage' },
];

export default function StudentDashboard() {
  const recent = complaints.slice(0, 3);

  return (
    <AppShell role="student" title={`Hey, ${currentStudent.name.split(' ')[0]}`} subtitle="Here's what's happening with your complaints.">
      <div className="dash-cards">
        {cards.map((c) => (
          <Link key={c.title} to={c.to} className={`dash-card accent-${c.accent}`}>
            <h3>{c.title}</h3>
            <p>{c.copy}</p>
          </Link>
        ))}
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>Recent complaints</h3>
          <Link to="/complaint-status" className="btn-link">View all</Link>
        </div>
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Complaint</th>
              <th>Department</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((c) => (
              <tr key={c.id}>
                <td>
                  <span className="mono ticket-id">{c.id}</span>
                  <span className="ticket-title">{c.title}</span>
                </td>
                <td>{c.department}</td>
                <td><StatusBadge status={c.status} /></td>
                <td className="mono">{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
