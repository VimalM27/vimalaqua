import Sidebar from './Sidebar';
import '../styles/app-shell.css';

export default function AppShell({ role, title, subtitle, children }) {
  return (
    <div className="app-shell">
      <Sidebar role={role} />
      <main className="app-main">
        <header className="app-header">
          <div>
            <p className="eyebrow">{role === 'admin' ? 'Admin Console' : 'Student Portal'}</p>
            <h1>{title}</h1>
            {subtitle && <p className="app-subtitle">{subtitle}</p>}
          </div>
        </header>
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
