import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import axios from "axios";
import { BASE_URL } from "../../utils/api";

const Login = () => {
  const { setUser } = useUser();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      console.log("Logging in with", mobile, password); // ✅ DEBUG LINE

      const res = await axios.post(
        `${BASE_URL}/api/users/login`,
        { mobile, password },
        { withCredentials: true },
      );

      console.log("Response:", res.data); // ✅ DEBUG LINE

      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);

      if (res.data.mustChangePassword) {
        navigate("/change-password");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message); // ✅ DEBUG LINE
      setError("Invalid credentials.");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input
        placeholder="Mobile Number"
        className="input"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        className="input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        onClick={handleLogin}
      >
        Login
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default Login;
