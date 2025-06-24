import { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '../context/UserContext'
import { Link } from 'react-router-dom'
import { BASE_URL } from '../utils/api'

const TopicList = () => {
  const { user } = useUser()
  const [topics, setTopics] = useState([])
  const [progress, setProgress] = useState([])
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')

    // Fetch topics assigned to the user
    axios
      .get(`${BASE_URL}/api/topics/assigned`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => setTopics(res.data))
      .catch(err => console.error('Error fetching topics', err))

    // Fetch progress
    axios
      .get(`${BASE_URL}/api/progress/${user.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => setProgress(res.data))
      .catch(err => console.error('Error fetching progress', err))
  }, [])

  const getStatus = topicId => {
    const match = progress.find(p => p.topicId._id === topicId)
    return match?.completed ? 'completed' : 'pending'
  }

  const filteredTopics = topics.filter(topic =>
    showCompleted
      ? getStatus(topic._id) === 'completed'
      : getStatus(topic._id) !== 'completed'
  )

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {showCompleted ? 'Completed Trainings' : 'Pending Trainings'}
      </h2>

      <div className="mb-4">
        <button
          onClick={() => setShowCompleted(false)}
          className={`px-3 py-2 mr-2 rounded ${
            !showCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setShowCompleted(true)}
          className={`px-3 py-2 rounded ${
            showCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Completed
        </button>
      </div>

      {filteredTopics.length === 0 && (
        <p className="text-gray-500">No topics found.</p>
      )}

      {filteredTopics.map(topic => (
        <Link
          to={`/topic/${topic._id}`}
          key={topic._id}
          className="block bg-white rounded shadow p-4 mb-4 hover:bg-gray-50"
        >
          <h3 className="text-lg font-bold">{topic.title}</h3>
          <p className="text-sm text-gray-600">{topic.objective}</p>
        </Link>
      ))}
    </div>
  )
}

export default TopicList
