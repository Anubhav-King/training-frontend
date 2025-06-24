import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import TopicList from './components/TopicList'
import TopicDetail from './components/TopicDetail'
import QuizView from './components/QuizView'
import AdminPanel from './components/AdminPanel'
import AdminRegister from './components/Auth/AdminRegister'
import Login from './components/Auth/Login'
import ChangePassword from './components/Auth/ChangePassword'
import UserManager from './components/Admin/UserManager'
import TopicAssigner from './components/Admin/TopicAssigner'
import UserProgressTable from './components/Admin/UserProgressTable'
import Welcome from './components/Welcome'
import { useUser } from './context/UserContext'
import Navbar from './components/Navbar'

function App() {
  const { user } = useUser()
  const location = useLocation()

  // Routes where Navbar should not show
  const hideNavbarRoutes = [
    '/login',
    '/register',
    '/register-admin',
    '/'
  ]

  const shouldHideNavbar = hideNavbarRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  )

  return (
    <div className="max-w-5xl mx-auto p-4">
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        {/* Show Welcome only when not logged in */}
        <Route path="/" element={user ? <Dashboard /> : <Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-admin" element={<AdminRegister />} />
        <Route path="/register" element={<AdminRegister />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/topics" element={<TopicList />} />
        <Route path="/topic/:id" element={<TopicDetail />} />
        <Route path="/quiz/:id" element={<QuizView />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/users" element={<UserManager />} />
        <Route path="/admin/assign-topics" element={<TopicAssigner />} />
        <Route path="/admin/progress" element={<UserProgressTable />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App
