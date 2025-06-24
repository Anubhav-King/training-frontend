import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { BASE_URL } from '../../utils/api'

const AdminRegister = () => {
  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    password: '',
    jobTitles: [],
    passcode: ''
  })
  const [jobInput, setJobInput] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleAddJob = () => {
    if (jobInput && !form.jobTitles.includes(jobInput)) {
      setForm({ ...form, jobTitles: [...form.jobTitles, jobInput] })
      setJobInput('')
    }
  }

  const handleRegister = async () => {
    try {
      await axios.post(`${BASE_URL}/api/users/register-admin`, form)
      setMessage('✅ Admin registered. You can now login.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setMessage('❌ Error registering admin.')
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Register Admin</h2>
      <input
        placeholder="Full Name"
        className="input"
        value={form.fullName}
        onChange={e => setForm({ ...form, fullName: e.target.value })}
      />
      <input
        placeholder="Mobile Number"
        className="input"
        value={form.mobile}
        onChange={e => setForm({ ...form, mobile: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        className="input"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
      />

      <div className="mb-2">
        <input
          placeholder="Add Job Title"
          className="input inline w-2/3"
          value={jobInput}
          onChange={e => setJobInput(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-3 py-2 rounded ml-2"
          onClick={handleAddJob}
        >
          Add
        </button>
      </div>

      <div className="mb-2 text-sm text-gray-700">
        Job Titles: {form.jobTitles.join(', ')}
      </div>

      <input
        placeholder="Passcode"
        type="password"
        className="input"
        value={form.passcode}
        onChange={e => setForm({ ...form, passcode: e.target.value })}
      />

      <button
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
        onClick={handleRegister}
      >
        Register Admin
      </button>

      {message && <p className="mt-2">{message}</p>}
    </div>
  )
}

export default AdminRegister
