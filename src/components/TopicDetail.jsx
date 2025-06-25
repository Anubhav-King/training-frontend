// ✅ FRONTEND: src/components/TopicDetail.jsx
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
    const headers = { Authorization: `Bearer ${token}` }

    axios
      .get(`${BASE_URL}/api/topics/${id}`, { headers })
      .then(res => {
        console.log('📝 fetched topic:', res.data)
        setTopic(res.data)
      })
      .catch(err => console.error('Failed to fetch topic', err))

    axios
      .get(`${BASE_URL}/api/progress/${user.userId}`, { headers })
      .then(res => {
        const matched = res.data.find(p => p.topicId._id === id)
        if (matched?.completed) setIsCompleted(true)
      })
      .catch(err => console.error('Failed to fetch progress', err))
  }, [id, user.userId])

  if (!topic) return <div>Loading...</div>

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{topic.title}</h1>

      {topic.imageUrl && (
        <img
          src={topic.imageUrl}
          alt="Topic"
          className="w-full max-h-64 object-cover rounded mb-4"
        />
      )}

      <div
        className="prose prose-blue max-w-none"
        dangerouslySetInnerHTML={{ __html: topic.content || '<p>No content available</p>' }}
      />

      {!isCompleted && (
        <div className="flex gap-4 mt-6">
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
        <p className="mt-4 text-green-700 font-semibold">
          ✅ This topic is already completed.
        </p>
      )}
      
    </div>
  )
}

export default TopicDetail
