import '../styles/status-badge.css';

const statusClass = {
  Pending: 'status-pending',
  'In Progress': 'status-progress',
  Resolved: 'status-resolved',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${statusClass[status] || ''}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}
