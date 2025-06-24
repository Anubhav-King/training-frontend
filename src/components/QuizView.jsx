import { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import axios from 'axios'
import { useUser } from '../context/UserContext'
import { BASE_URL } from '../utils/api'

const QuizView = () => {
  const { id } = useParams()
  const { user } = useUser()
  const navigate = useNavigate()

  const [topic, setTopic] = useState(null)
  const [answers, setAnswers] = useState({})
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('token')

    axios
      .get(`${BASE_URL}/api/topics/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setTopic(res.data))
      .catch(err => console.error('Failed to load quiz', err))
  }, [id, retryCount])

  // Prevent exit before quiz is submitted
  useEffect(() => {
    const handleBeforeUnload = e => {
      if (!submitted) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handlePopState = () => {
      if (!submitted) {
        alert('⚠️ You must submit the quiz before leaving!')
        navigate(0)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [submitted, navigate])

  const handleSelect = (index, value) => {
    setAnswers(prev => ({ ...prev, [index]: value }))
  }

  const handleSubmit = async () => {
    if (!topic) return

    if (Object.keys(answers).length !== topic.quiz.length) {
      alert('Please answer all questions before submitting.')
      return
    }

    let correct = 0
    topic.quiz.forEach((q, i) => {
      if (q.correctAnswer === answers[i]) correct++
    })

    setCorrectCount(correct)
    const passed = correct === topic.quiz.length
    setFeedback(passed ? '✅ Topic Completed!' : `❌ You got ${correct}/${topic.quiz.length} correct`)
    setSubmitted(true)

    const token = localStorage.getItem('token')
    try {
      await axios.post(
        `${BASE_URL}/api/progress`,
        {
          userId: user.userId,
          topicId: id,
          passed,
          retryCount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (passed) {
        setTimeout(() => navigate('/'), 1500)
      }
    } catch (err) {
      console.error('Failed to submit progress', err)
    }
  }

  const handleRetryNow = () => {
    setAnswers({})
    setFeedback('')
    setSubmitted(false)
    setRetryCount(prev => prev + 1)
  }

  const handleRetryLater = () => {
    navigate('/pending-topics')
  }

  if (submitted && feedback.includes('✅')) {
    return <Navigate to="/" />
  }

  if (!topic) return <div>Loading...</div>

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Quiz: {topic.title}</h2>

      {topic.quiz.map((q, idx) => (
        <div key={idx} className="mb-4">
          <p className="font-semibold">
            {idx + 1}. {q.question}
          </p>
          {q.options.map((opt, i) => (
            <label key={i} className="block ml-4">
              <input
                type="radio"
                name={`q${idx}`}
                value={opt}
                onChange={() => handleSelect(idx, opt)}
                checked={answers[idx] === opt}
                disabled={submitted}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      {feedback && (
        <div className={`font-bold mt-4 ${feedback.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          <p>{feedback}</p>
        </div>
      )}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={submitted}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Quiz
        </button>
      )}

      {submitted && feedback.includes('❌') && (
        <div className="mt-6 space-x-4">
          <button
            onClick={handleRetryNow}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Retry Now
          </button>
          <button
            onClick={handleRetryLater}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Retry Later
          </button>
        </div>
      )}
    </div>
  )
}

export default QuizView
