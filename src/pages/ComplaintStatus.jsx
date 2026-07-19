import { useState } from 'react';
import AppShell from '../components/AppShell';
import StatusBadge from '../components/StatusBadge';
import { complaints } from '../services/mockData';
import '../styles/dashboard.css';

const filters = ['All', 'Pending', 'In Progress', 'Resolved'];

export default function ComplaintStatus() {
  const [filter, setFilter] = useState('All');
  const visible = filter === 'All' ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <AppShell role="student" title="Complaint status" subtitle="Track every complaint you've raised, end to end.">
      <div className="filter-row">
        {filters.map((f) => (
          <button
            key={f}
            className={'filter-chip' + (filter === f ? ' active' : '')}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <section className="panel">
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
            {visible.map((c) => (
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
            {visible.length === 0 && (
              <tr><td colSpan="4" style={{ color: 'var(--text-muted)', padding: '20px 10px' }}>No complaints in this status.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
