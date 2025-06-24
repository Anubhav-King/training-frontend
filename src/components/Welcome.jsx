// src/components/Welcome.jsx
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Learning Portal</h1>
      <button
        className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
        onClick={() => navigate('/login')}
      >
        Login
      </button>
    </div>
  );
};

export default Welcome;
