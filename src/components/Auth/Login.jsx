import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { BASE_URL } from "../../utils/api";

const Login = () => {
  const [mobile, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/users/login`, {
        mobile,
        password,
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      setUser(user);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-4 max-w-md mx-auto space-y-3">
      <h2 className="text-xl font-bold">Login</h2>
      <input
        type="mobile"
        placeholder="Mobile"
        value={mobile}
        onChange={(e) => setEmail(e.target.value)}
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
    </form>
  );
};

export default Login;
