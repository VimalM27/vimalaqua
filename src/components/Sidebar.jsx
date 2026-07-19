import { NavLink } from 'react-router-dom';
import '../styles/sidebar.css';

export default function Sidebar({ role = 'student' }) {
  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/raise-complaint', label: 'Raise Complaint' },
    { to: '/complaint-status', label: 'Complaint Status' },
    { to: '/profile', label: 'My Profile' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/complaint-status', label: 'All Complaints' },
    { to: '/profile', label: 'My Profile' },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-mark">CC</span>
        <span className="sidebar-name">CampusConnect</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/" className="sidebar-link logout">Logout</NavLink>
      </div>
    </aside>
  );
}
