import { Link } from 'react-router-dom';

const AdminPanel = () => {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <p className="mb-6">Welcome, Admin! Use the tools below to manage training content and users.</p>

      <div className="flex flex-col gap-4 max-w-sm">
        <Link
          to="/admin/users"
          className="bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700 transition"
        >
          👥 Manage Users
        </Link>

        <Link
          to="/admin/assign-topics"
          className="bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700 transition"
        >
          🗂 Assign Topics to Users or Roles
        </Link>

        <Link
          to="/admin/progress"
          className="bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700 transition"
        >
          📊 View User Progress Summary
        </Link>
      </div>
    </div>
  );
};

export default AdminPanel;
