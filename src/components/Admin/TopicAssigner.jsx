import { useEffect, useState } from 'react'
import axios from 'axios'

const TopicAssigner = () => {
  const [topics, setTopics] = useState([])
  const [users, setUsers] = useState([])
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchTopics()
    fetchUsers()
  }, [])

  const fetchTopics = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/topics')
      setTopics(res.data)
    } catch (err) {
      console.error('Error fetching topics', err)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/list')
      setUsers(res.data)
    } catch (err) {
      console.error('Error fetching users', err)
    }
  }

  const handleAssign = async () => {
    if (!selectedTopicId || !selectedUserId) {
      setMessage('Please select both topic and user')
      return
    }
    try {
      await axios.post('http://localhost:5000/api/topics/assign', {
        topicId: selectedTopicId,
        userId: selectedUserId,
      })
      setMessage('✅ Topic assigned successfully')
    } catch (err) {
      setMessage('❌ Failed to assign topic')
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">Assign Topics to Users</h2>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Select Topic</label>
        <select
          className="input w-full"
          value={selectedTopicId}
          onChange={e => setSelectedTopicId(e.target.value)}
        >
          <option value="">-- Select Topic --</option>
          {topics.map(topic => (
            <option key={topic._id} value={topic._id}>
              {topic.title} ({topic.jobTitles.join(', ')})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Select User</label>
        <select
          className="input w-full"
          value={selectedUserId}
          onChange={e => setSelectedUserId(e.target.value)}
        >
          <option value="">-- Select User --</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>
              {user.fullName} ({user.jobTitles.join(', ')})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAssign}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Assign Topic
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}

export default TopicAssigner
