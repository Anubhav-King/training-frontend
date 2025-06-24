import { useState, useEffect } from 'react'
import axios from 'axios'
import { BASE_URL } from '../../utils/api';

const UserManager = () => {
  const [fullName, setFullName] = useState('')
  const [mobile, setMobile] = useState('')
  const [jobTitlesInput, setJobTitlesInput] = useState('')
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const jobTitles = jobTitlesInput
    .split(',')
    .map(j => j.trim())
    .filter(Boolean)

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/users/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleCreate = async () => {
    if (!fullName || !mobile || jobTitles.length === 0) {
      setError('Please fill all fields and add at least one job title')
      return
    }
    setLoading(true)
    try {
      await axios.post('http://localhost:5000/api/users/add-user', {
        fullName,
        mobile,
        jobTitles,
        password: 'Monday01',
      })
      setError('')
      fetchUsers()
      setFullName('')
      setMobile('')
      setJobTitlesInput('')
    } catch (err) {
      setError('Error adding user')
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (userId, current) => {
    try {
      await axios.post('http://localhost:5000/api/users/deactivate-user', {
        userId,
        active: !current,
      })
      fetchUsers()
    } catch (err) {
      setError('Failed to update user status')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="bg-white p-6 rounded shadow mt-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">User Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <input
          className="input"
          placeholder="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Mobile"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
        />
        <input
          className="input"
          placeholder="Job Titles (comma separated)"
          value={jobTitlesInput}
          onChange={e => setJobTitlesInput(e.target.value)}
        />
      </div>
      <button
        onClick={handleCreate}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add User'}
      </button>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <h3 className="text-lg font-semibold mb-2">All Users</h3>
      <ul>
        {users.map(user => (
          <li
            key={user._id}
            className={`text-sm mb-1 ${
              !user.active ? 'text-gray-400 line-through' : 'text-gray-800'
            }`}
          >
            {user.fullName} - {user.mobile} - {user.jobTitles?.join(', ')}{' '}
            {user.isAdmin ? '(Admin)' : ''}
            <button
              className={`ml-3 px-2 py-1 rounded ${
                user.active ? 'bg-red-500' : 'bg-green-600'
              } text-white`}
              onClick={() => toggleActive(user._id, user.active)}
            >
              {user.active ? 'Deactivate' : 'Activate'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UserManager
