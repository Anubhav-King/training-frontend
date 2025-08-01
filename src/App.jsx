import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import TopicList from "./components/TopicList";
import TopicDetail from "./components/TopicDetail";
import QuizView from "./components/QuizView";
import AdminPanel from "./components/AdminPanel";
import AdminRegister from "./components/Auth/AdminRegister";
import Login from "./components/Auth/Login";
import ChangePassword from "./components/Auth/ChangePassword";
import UserManager from "./components/Admin/UserManager";
import TopicAssigner from "./components/Admin/TopicAssigner";
import UserProgressTable from "./components/Admin/UserProgressTable";
import Welcome from "./components/Welcome";
import { useUser } from "./context/UserContext";
import Navbar from "./components/Navbar";
import TopicImageUploader from "./components/Admin/TopicImageUploader";
import { useUpload } from "./context/UploadContext";

function App() {
  const { user } = useUser();
  const location = useLocation();
  const { uploading, uploadProgress } = useUpload();

   console.log("Upload Progress State:", uploadProgress, "Uploading:", uploading);

  // Routes where Navbar should not show
  const hideNavbarRoutes = [
    "/login",
    "/register",
    "/register-admin",
    "/quiz",
    "/change-password",
    "/",
  ];

  const shouldHideNavbar = hideNavbarRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route + "/"),
  );

  // Calculate average upload progress %
  const progressValues = Object.values(uploadProgress);
  const totalProgress =
    progressValues.length > 0
      ? Math.floor(progressValues.reduce((a, b) => a + b, 0) / progressValues.length)
      : 0;

  return (
    <div className="max-w-5xl mx-auto p-4 relative">
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
        <Route path="/admin/topic-images" element={<TopicImageUploader />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {uploading && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50"
          style={{ backdropFilter: "blur(3px)" }}
        >
          <div className="text-white text-lg mb-4 font-semibold">Uploading... Please wait</div>
          <div className="w-64 h-4 bg-gray-700 rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-blue-500 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
