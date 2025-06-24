import { useUser } from '../context/UserContext'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { BASE_URL } from '../utils/api'

const Dashboard = () => {
  const { user } = useUser()
  const [progress, setProgress] = useState([])

  // ✅ Add this line right after getting `user`
  if (!user) return <p>Loading...</p>;

  useEffect(() => {
    const token = localStorage.getItem('token')

    axios
      .get(`${BASE_URL}/api/progress/${user.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => setProgress(res.data))
      .catch(err => console.error('Progress fetch failed', err))
  }, [])

  const completed = progress.filter(p => p.completed).length
  const pending = progress.length - completed

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.fullName}</h1>

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
