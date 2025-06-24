import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../utils/api';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const adminName = localStorage.getItem('adminName');

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await axios.get(`${BASE_URL}/api/users/list`, config);
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB');
  };

  const handleApprove = async (userId) => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.post(`${BASE_URL}/api/users/approve-user`, { userId, adminName }, config);
    fetchUsers();
  };

  const handleDeactivate = async (userId) => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.post(`${BASE_URL}/api/users/deactivate-user`, { userId, adminName }, config);
    fetchUsers();
  };

  const handleReactivate = async (userId) => {
    const code = prompt('Enter reactivation code');
    if (!code) return;
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.post(`${BASE_URL}/api/users/reactivate-user`, { userId, code, adminName }, config);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Reactivation failed');
    }
  };

  const handleResetPassword = async (userId) => {
    const confirm = window.confirm('Reset password to default (Monday01)?');
    if (!confirm) return;
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.post(
        `${BASE_URL}/api/users/reset-password/${userId}`,
        { adminName },
        config
      );
      alert('Password reset to default (Monday01)');
    } catch (err) {
      alert('Reset failed');
    }
  };

  const filteredUsers = users.filter((user) => {
    if (activeTab === 'current') {
      return user.active;
    }
    if (activeTab === 'pending') {
      return !user.active && !user.approvedBy && !user.deactivatedBy;
    }
    if (activeTab === 'deactivated') {
      return !user.active && user.approvedBy;
    }
    return false;
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Manager</h2>

      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('current')}
        >
          Current Users
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Acceptances
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'deactivated' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('deactivated')}
        >
          Deactivated Users
        </button>
      </div>

      <ul className="space-y-2">
        {filteredUsers.map((user) => (
          <li key={user._id} className="border p-3 rounded shadow flex flex-col">
            <div>
              <strong>{user.name}</strong> — {user.mobile} — {user.jobTitles?.join(', ') || 'N/A'}
            </div>

            {user.approvedBy && (
              <div className="text-green-600">
                Approved by {user.approvedBy} on {formatDate(user.approvedAt)}
              </div>
            )}
            {!user.approvedBy && user.active && (
              <div className="text-gray-500 italic">
                Legacy User (pre-approval)
              </div>
            )}
            {user.deactivatedBy && (
              <div className="text-red-600">
                Deactivated by {user.deactivatedBy} on {formatDate(user.deactivatedAt)}
              </div>
            )}
            {user.reactivatedBy && (
              <div className="text-blue-600">
                Reactivated by {user.reactivatedBy} on {formatDate(user.reactivatedAt)}
              </div>
            )}

            <div className="mt-2 flex space-x-4">
              {activeTab === 'pending' && (
                <button
                  onClick={() => handleApprove(user._id)}
                  className="text-green-600 hover:underline"
                >
                  Approve
                </button>
              )}

              {activeTab === 'current' && (
                <>
                  <button
                    onClick={() => handleDeactivate(user._id)}
                    className="text-red-600 hover:underline"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleResetPassword(user._id)}
                    className="text-yellow-600 hover:underline"
                  >
                    Reset Password
                  </button>
                </>
              )}

              {activeTab === 'deactivated' && (
                <button
                  onClick={() => handleReactivate(user._id)}
                  className="text-blue-600 hover:underline"
                >
                  Reactivate
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManager;
