import { useUser } from '../context/UserContext'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { BASE_URL } from '../utils/api'

const Dashboard = () => {
  const { user, setUser } = useUser()
  const [topics, setTopics] = useState([])
  const [progress, setProgress] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return

    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    axios
      .get(`${BASE_URL}/api/topics/assigned`, { headers })
      .then(res => setTopics(res.data))
      .catch(err => console.error('Error fetching assigned topics', err))

    axios
      .get(`${BASE_URL}/api/progress/${user.userId}`, { headers })
      .then(res => setProgress(res.data))
      .catch(err => console.error('Error fetching progress', err))
  }, [user])

  if (!user) return <p>Loading...</p>

  const getStatus = topic => {
    const match = progress.find(p => p.topicId._id === topic._id)
    return match?.completed ? 'completed' : 'pending'
  }

  const completed = topics.filter(t => getStatus(t) === 'completed').length
  const pending = topics.length - completed

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Progress Summary */}
      <div className="bg-white shadow-md p-6 rounded-md mb-6">
        <p className="text-lg font-semibold">Your Training Progress</p>
        <div className="flex gap-4 mt-4">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
            Completed: {completed}
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">
            Pending: {pending}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <Link
          to="/topics"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          Go to Training Topics
        </Link>
        {user.isAdmin && (
          <Link
            to="/admin"
            className="bg-purple-600 text-white px-4 py-2 rounded shadow"
          >
            Go to Admin Panel
          </Link>
        )}
      </div>
    </div>
  )
}

export default Dashboard
