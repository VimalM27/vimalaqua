import '../styles/auth.css';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-screen">
      <div className="auth-visual">
        <div className="auth-visual-inner">
          <span className="sidebar-mark">CC</span>
          <h2 className="auth-visual-title">CampusConnect</h2>
          <p className="auth-visual-copy">
            Raise it, track it, resolve it — one desk for every campus issue.
          </p>

          <div className="pass-card">
            <div className="pass-row">
              <span className="eyebrow">Support Pass</span>
              <span className="mono pass-id">NO. 1042</span>
            </div>
            <div className="pass-divider" />
            <div className="pass-row">
              <span className="pass-field">Status</span>
              <span className="pass-field-value">In Progress</span>
            </div>
            <div className="pass-row">
              <span className="pass-field">Department</span>
              <span className="pass-field-value">Facilities</span>
            </div>
            <div className="pass-perforation" />
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box">
          <p className="eyebrow">CampusConnect</p>
          <h1>{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
