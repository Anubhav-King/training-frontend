// src/components/Welcome.jsx
import { useNavigate } from 'react-router-dom'

const Welcome = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center space-y-6">
      <h1 className="text-3xl font-bold">Welcome to the Learning Portal</h1>

      <div className="space-x-4">
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <button
          className="bg-green-600 text-white px-6 py-3 rounded text-lg"
          onClick={() => navigate('/register')}
        >
          Register (New User)
        </button>
      </div>
    </div>
  )
}

export default Welcome
