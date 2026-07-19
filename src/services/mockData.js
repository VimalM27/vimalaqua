// Stand-in for the backend REST API (see spec: /api/complaints, /api/profile, /api/auth)
// Swap these for real axios calls once the backend is wired up.

export const currentStudent = {
  name: 'Ananya Rao',
  email: 'ananya.rao@campus.edu',
  phone: '+91 98765 43210',
  department: 'Computer Science',
  semester: '5th Semester',
};

export const complaints = [
  {
    id: 'CC-1042',
    title: 'Hostel Wi-Fi down since Monday',
    category: 'Infrastructure',
    department: 'Hostel Admin',
    status: 'Pending',
    date: '2026-07-14',
  },
  {
    id: 'CC-1039',
    title: 'Library book fine dispute',
    category: 'Academic',
    department: 'Library',
    status: 'In Progress',
    date: '2026-07-11',
  },
  {
    id: 'CC-1031',
    title: 'Broken chair in Lab 3',
    category: 'Infrastructure',
    department: 'Facilities',
    status: 'Resolved',
    date: '2026-07-02',
  },
  {
    id: 'CC-1028',
    title: 'Scholarship disbursement delay',
    category: 'Finance',
    department: 'Accounts',
    status: 'In Progress',
    date: '2026-06-29',
  },
  {
    id: 'CC-1019',
    title: 'Canteen food quality',
    category: 'General',
    department: 'Facilities',
    status: 'Resolved',
    date: '2026-06-20',
  },
];

export const adminStats = {
  totalStudents: 1284,
  totalComplaints: 342,
  pending: 58,
  resolved: 261,
};

export const departmentBreakdown = [
  { department: 'Facilities', count: 96 },
  { department: 'Academic', count: 84 },
  { department: 'Hostel Admin', count: 71 },
  { department: 'Accounts', count: 52 },
  { department: 'Library', count: 39 },
];

export const statusBreakdown = [
  { status: 'Resolved', count: 261 },
  { status: 'In Progress', count: 23 },
  { status: 'Pending', count: 58 },
];
