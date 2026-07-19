import '../styles/stat-card.css';

export default function StatCard({ label, value, accent = 'ink' }) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label eyebrow">{label}</div>
    </div>
  );
}
