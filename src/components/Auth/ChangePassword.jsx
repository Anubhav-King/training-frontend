import { useUser } from '../../context/UserContext'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { BASE_URL } from '../../utils/api'

const ChangePassword = () => {
  const { user } = useUser()
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        `${BASE_URL}/api/users/change-password`,
        {
          userId: user.userId,
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setMessage('✅ Password updated.')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(`❌ ${err.response.data.message}`)
      } else {
        setMessage('❌ Password update failed.')
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Change Your Password</h2>
      <input
        placeholder="New Password"
        type="password"
        className="input"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
      />
      <button
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
        onClick={handleChange}
      >
        Update Password
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  )
}

export default ChangePassword
