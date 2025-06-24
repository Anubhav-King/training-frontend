import { useEffect, useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '../../utils/api'

const UserManager = () => {
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  const fetchUsers = async () => {
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const res = await axios.get(`${BASE_URL}/api/users/list`, config)
    //console.log('Fetched users:', res.data)
    setUsers(res.data)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAdd = async () => {
    const form = { name, mobile, jobTitle }
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }
    await axios.post(`${BASE_URL}/api/users/add-user`, form, config)
    setName('')
    setMobile('')
    setJobTitle('')
    fetchUsers()
  }

  const handleDeactivate = async userId => {
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }
    await axios.post(`${BASE_URL}/api/users/deactivate-user`, { userId }, config)
    fetchUsers()
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">User Manager</h2>

      <div className="space-y-2 mb-4">
        <input
          type="text"
          placeholder="Name"
          className="block w-full border px-3 py-2"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mobile"
          className="block w-full border px-3 py-2"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
        />
        <input
          type="text"
          placeholder="Job Title"
          className="block w-full border px-3 py-2"
          value={jobTitle}
          onChange={e => setJobTitle(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add User
        </button>
      </div>

      <ul className="space-y-2">
        {users.map(user => (
          <li key={user._id} className="border p-2 flex justify-between items-center">
            <span>
              <strong>{user.name || user.mobile}</strong> – {Array.isArray(user.jobTitles) ? user.jobTitles.join(', ') : user.jobTitles || 'N/A'}
            </span>
            <button
              onClick={() => handleDeactivate(user._id)}
              className="text-red-600 hover:underline"
            >
              Deactivate
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UserManager
