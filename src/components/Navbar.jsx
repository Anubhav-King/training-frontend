// src/components/Navbar.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register-admin') return null;

  return (
    <div className="flex justify-between items-center bg-gray-200 px-4 py-2 mb-4 rounded">
      <div className="flex gap-2">
        <button onClick={() => navigate(-1)} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">Back</button>
        <button onClick={() => navigate('/')} className="text-sm bg-green-600 text-white px-3 py-1 rounded">Home</button>
      </div>
      <button onClick={handleLogout} className="text-sm bg-red-500 text-white px-3 py-1 rounded">Logout</button>
    </div>
  );
};

export default Navbar;
