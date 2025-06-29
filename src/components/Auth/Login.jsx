import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { BASE_URL } from "../../utils/api";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [adminNames, setAdminNames] = useState([]);
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/users/login`, {
        mobile,
        password,
      });

      const { token, user, mustChangePassword } = res.data;

      if (!user.active || !user.approvedBy) {
        // If not yet approved
        const res2 = await axios.get(`${BASE_URL}/api/users/list`);
        const admins = res2.data.filter((u) => u.isAdmin);
        const names = admins.map((a) => a.name).join(", ");
        alert(
          `❌ User is not yet activated.\nKindly contact Admin(s): ${names}`
        );
        return;
      }

      // Proceed with login
      localStorage.setItem("token", token);
      setUser(user);
      navigate("/");
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.error || "Login failed. Please try again.";
      alert(`❌ ${message}`);
    }
  };


  useEffect(() => {
    // Fetch admin names
    const fetchAdmins = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/users/list`);
        const admins = res.data.filter((user) =>
          user.jobTitles?.includes("Admin")
        );
        setAdminNames(admins.map((admin) => admin.name));
      } catch (err) {
        console.error("Failed to fetch admins", err);
        setAdminNames([]);
      }
    };
    fetchAdmins();
  }, []);

  return (
    <form onSubmit={handleLogin} className="p-4 max-w-md mx-auto space-y-3">
      <h2 className="text-xl font-bold">Login</h2>
      <input
        type="text"
        placeholder="Mobile"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        className="w-full border px-3 py-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border px-3 py-2"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Login
      </button>

      {/* Forgot Password */}
      <p
        className="text-sm text-right text-blue-600 hover:underline cursor-pointer"
        onClick={() => setShowPopup(true)}
      >
        Forgot Password?
      </p>

      {/* Registration */}
      <p className="text-sm text-center mt-4">
        Don’t have an account?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register here
        </Link>
      </p>

      {/* Forgot Password Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Forgot Password</h3>
            {adminNames.length === 0 ? (
              <p className="text-sm mb-4">Unable to fetch Admins. Please try again later.</p>
            ) : (
              <p className="text-sm mb-4">
                Kindly contact the Admin:
                <br />
                <strong>{adminNames.join(", ")}</strong>
              </p>
            )}
            <div className="text-right">
              <button
                onClick={() => setShowPopup(false)}
                className="text-sm text-blue-600 hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default Login;
