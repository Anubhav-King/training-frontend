import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import axios from 'axios'
import { BASE_URL } from '../utils/api'
import ImagePreviewModal from './common/ImagePreviewModal';

const TopicDetail = () => {
  const { id } = useParams()
  const { user } = useUser()
  const [topic, setTopic] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [previewImages, setPreviewImages] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(null);
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    axios
      .get(`${BASE_URL}/api/topics/${id}`, { headers })
      .then(res => setTopic(res.data))
      .catch(err => console.error('Failed to fetch topic', err))

    axios
      .get(`${BASE_URL}/api/progress/${user.userId}`, { headers })
      .then(res => {
        const matched = res.data.find(p => p.topicId._id === id)
        if (matched?.completed) setIsCompleted(true)
      })
      .catch(err => console.error('Failed to fetch progress', err))
  }, [id, user.userId])

  const extractSection = (html, title) => {
    const pattern = new RegExp(`<h2>${title}</h2>(.*?)<h2>|<h2>${title}</h2>(.*)$`, 'is')
    const match = html.match(pattern)
    return match ? (match[1] || match[2] || '').trim() : ''
  }

  if (!topic) return <div>Loading...</div>

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{topic.title}</h1>

      {['Objective', 'Process Explained', 'Task Breakdown', 'Self Check'].map(section => {
        const content = extractSection(topic.content, section)
        const imageKey = section.toLowerCase().replace(/\s/g, '')

        return (
          <div key={section} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{section}</h2>
            <div dangerouslySetInnerHTML={{ __html: content }} />

            <div className="mt-2 flex flex-wrap gap-2">
              {topic.images?.[imageKey]?.map((url, i, arr) => (
                <img
                  key={i}
                  src={url}
                  alt={`${section} img`}
                  className="w-40 h-28 object-cover rounded cursor-pointer"
                  onClick={() => {
                    setPreviewImages(arr);
                    setPreviewIndex(i);
                  }}
                />
              ))}

            </div>
          </div>
        )
      })}

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
      <ImagePreviewModal
        images={previewImages}
        index={previewIndex}
        onClose={() => setPreviewIndex(null)}
      />
    </div>
  )
}

export default TopicDetail
