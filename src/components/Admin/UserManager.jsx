import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../utils/api';

const JOB_TITLES = [
  "Manager", "Staff", "Admin", "HR", "Technician", "Supervisor", "Intern"
];

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [editingUserId, setEditingUserId] = useState(null);
  const [tempJobTitles, setTempJobTitles] = useState([]);
  const [logModalUser, setLogModalUser] = useState(null);
  const [jobLogs, setJobLogs] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await axios.get(`${BASE_URL}/api/users/list`, config);
    setUsers(res.data);
  };

  

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Unknown time';
    const d = new Date(dateStr);
    if (isNaN(d)) return 'Invalid date';
    return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-GB')}`;
  };

  const handleApprove = async (userId) => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.post(`${BASE_URL}/api/users/approve-user`, { userId }, config);
    fetchUsers();
  };

  const handleDeactivate = async (userId) => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.post(`${BASE_URL}/api/users/deactivate-user`, { userId }, config);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Deactivation failed');
    }
  };

  const handleReactivate = async (userId) => {
    const code = prompt('Enter reactivation code');
    if (!code) return;
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.post(`${BASE_URL}/api/users/reactivate-user`, { userId, code }, config);
    fetchUsers();
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Reset password to Monday01?')) return;
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.post(`${BASE_URL}/api/users/reset-password/${userId}`, {}, config);
    alert('Password reset to Monday01');
  };

  const startEditing = (user) => {
    setEditingUserId(user._id);
    setTempJobTitles(user.jobTitles || []);
  };

  const toggleJobTitle = (title) => {
    setTempJobTitles(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const saveJobTitles = async (userId) => {
    const code = prompt("Enter passcode to save changes");
    if (code !== "Boss@2025") {
      alert("Incorrect passcode.");
      return;
    }

    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.patch(`${BASE_URL}/api/users/update-jobtitles/${userId}`, { jobTitles: tempJobTitles, code }, config);
      setEditingUserId(null);
      fetchUsers();
      alert("Job titles updated successfully.");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to update job titles: " + (err.response?.data?.error || err.message));
    }
  };

  const openLogsModal = async (user) => {
    setLogModalUser(user);
    setLogLoading(true);
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const res = await axios.get(`${BASE_URL}/api/users/joblogs/${user._id}`, config);
      setJobLogs(res.data.logs || []);
    } catch (err) {
      console.error("Failed to load logs", err);
      setJobLogs([]);
    }
    setLogLoading(false);
  };

  const closeLogsModal = () => {
    setLogModalUser(null);
    setJobLogs([]);
  };

  const filteredUsers = users.filter((user) => {
    if (activeTab === 'current') return user.active;
    if (activeTab === 'pending') return !user.active && !user.approvedBy && !user.deactivatedBy;
    if (activeTab === 'deactivated') return !user.active && (user.deactivatedBy || user.approvedBy);
    return false;
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Manager</h2>

      <div className="flex space-x-4 mb-6">
        {["current", "pending", "deactivated"].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "current" ? "Current Users" : tab === "pending" ? "Pending Acceptances" : "Deactivated Users"}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {filteredUsers.map((user) => (
          <li key={user._id} className="border p-3 rounded shadow flex flex-col">
            <div>
              <strong>{user.name}</strong> — {user.mobile}
            </div>

            {/* 🔄 Job Title Section */}
            {editingUserId === user._id ? (
              <div className="my-2 grid grid-cols-2 gap-1 text-sm">
                {JOB_TITLES.map((title) => (
                  <label key={title} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={tempJobTitles.includes(title)}
                      onChange={() => toggleJobTitle(title)}
                    />
                    <span>{title}</span>
                  </label>
                ))}
                <div className="col-span-2 mt-2">
                  <button
                    onClick={() => saveJobTitles(user._id)}
                    className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingUserId(null)}
                    className="text-gray-500 underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm my-1">
                Job Titles: {user.jobTitles?.join(', ') || 'N/A'}{" "}
                {activeTab === 'current' && (
                  <button onClick={() => startEditing(user)} className="text-blue-600 text-sm ml-2 underline">
                    Edit
                  </button>
                )}
              </div>
            )}

            <div className="mt-2 flex space-x-4">
              {activeTab === 'pending' && (
                <button onClick={() => handleApprove(user._id)} className="text-green-600 hover:underline">Approve</button>
              )}
              {activeTab === 'current' && (
                <>
                  <button onClick={() => handleDeactivate(user._id)} className="text-red-600 hover:underline">Deactivate</button>
                  <button onClick={() => handleResetPassword(user._id)} className="text-yellow-600 hover:underline">Reset Password</button>
                </>
              )}
              {activeTab === 'deactivated' && (
                <button onClick={() => handleReactivate(user._id)} className="text-blue-600 hover:underline">Reactivate</button>
              )}
              <button onClick={() => openLogsModal(user)} className="text-purple-600 hover:underline">Logs</button>
            </div>
          </li>
        ))}
      </ul>

      {/* 🧾 Logs Modal */}
      {logModalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Logs for {logModalUser.name}
              </h3>
              <button onClick={closeLogsModal} className="text-gray-600 hover:text-black">✖</button>
            </div>

            {logLoading ? (
              <div>Loading logs...</div>
            ) : (
              <>
                <div className="mb-4">
                  <h4 className="font-bold text-blue-700 mb-1">Activation Logs</h4>
                  <ul className="text-sm list-disc pl-5">
                    {logModalUser.approvedBy && (
                      <li>Approved by {logModalUser.approvedBy} on {formatDateTime(logModalUser.approvedAt)}</li>
                    )}
                    {logModalUser.deactivatedBy && (
                      <li>Deactivated by {logModalUser.deactivatedBy} on {formatDateTime(logModalUser.deactivatedAt)}</li>
                    )}
                    {logModalUser.reactivatedBy && (
                      <li>Reactivated by {logModalUser.reactivatedBy} on {formatDateTime(logModalUser.reactivatedAt)}</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-green-700 mb-1">Job Title Change Logs</h4>
                  <ul className="text-sm list-disc pl-5">
                    {jobLogs.length === 0 ? (
                      <li>No job title changes logged.</li>
                    ) : (
                      jobLogs.map((log, idx) => (
                        <li key={idx}>
                          {log.changedBy} on {formatDateTime(log.timestamp)} — changed to: {log.jobTitles.join(", ")}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </>
            )}

            <div className="mt-4 text-right">
              <button onClick={closeLogsModal} className="bg-blue-600 text-white px-4 py-1 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
