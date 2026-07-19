import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import AppShell from '../components/AppShell';
import StatCard from '../components/StatCard';
import { adminStats, departmentBreakdown, statusBreakdown } from '../services/mockData';
import '../styles/dashboard.css';

const STATUS_COLORS = {
  Resolved: '#4C9A6A',
  'In Progress': '#D9634A',
  Pending: '#E8A33D',
};

export default function AdminDashboard() {
  return (
    <AppShell role="admin" title="Admin overview" subtitle="Complaint volume and resolution across departments.">
      <div className="dash-cards">
        <StatCard label="Total Students" value={adminStats.totalStudents.toLocaleString()} accent="ink2" />
        <StatCard label="Total Complaints" value={adminStats.totalComplaints.toLocaleString()} accent="amber" />
        <StatCard label="Pending" value={adminStats.pending} accent="coral" />
        <StatCard label="Resolved" value={adminStats.resolved} accent="sage" />
      </div>

      <div className="chart-grid">
        <section className="panel">
          <div className="panel-header">
            <h3>Department-wise complaints</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={departmentBreakdown} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DFDCD2" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 11.5, fill: '#6A6F84' }} interval={0} angle={-18} textAnchor="end" height={56} />
              <YAxis tick={{ fontSize: 11.5, fill: '#6A6F84' }} />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #DFDCD2' }} />
              <Bar dataKey="count" fill="#3E4C8C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Complaint statistics</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusBreakdown} dataKey="count" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {statusBreakdown.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Pie>
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12.5 }} />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #DFDCD2' }} />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>
    </AppShell>
  );
}
