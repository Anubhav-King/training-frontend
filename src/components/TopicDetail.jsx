import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import axios from 'axios'
import { BASE_URL } from '../utils/api'

const TopicDetail = () => {
  const { id } = useParams()
  const { user } = useUser()
  const [topic, setTopic] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')

    // Fetch topic details
    axios
      .get(`${BASE_URL}/api/topics/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setTopic(res.data))
      .catch(err => console.error('Failed to fetch topic', err))

    // Check if completed
    axios
      .get(`${BASE_URL}/api/progress/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        const matched = res.data.find(p => p.topicId._id === id)
        if (matched?.completed) setIsCompleted(true)
      })
      .catch(err => console.error('Failed to fetch progress', err))
  }, [id, user.userId])

  if (!topic) return <div>Loading...</div>

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-2">{topic.title}</h1>

      {topic.imageUrl && (
        <img
          src={topic.imageUrl}
          alt="Topic"
          className="w-full max-h-64 object-cover rounded mb-4"
        />
      )}

      <p className="mb-2"><strong>Objective:</strong> {topic.objective}</p>
      <p className="mb-2"><strong>Process Explained:</strong> {topic.process}</p>
      <p className="mb-2"><strong>Task Breakdown:</strong> {topic.breakdown}</p>
      <p className="mb-2"><strong>Self Check:</strong> {topic.selfCheck}</p>

      {!isCompleted && (
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => navigate(`/quiz/${topic._id}`)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Mark Completed Now
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Mark Completed Later
          </button>
        </div>
      )}

      {isCompleted && (
        <p className="mt-4 text-green-700 font-semibold">✅ This topic is already completed.</p>
      )}
    </div>
  )
}

export default TopicDetail
