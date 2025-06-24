import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/api";

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${BASE_URL}/api/users/change-password`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Password changed successfully");
    } catch (err) {
      console.error(err);
      alert("Password change failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto space-y-3">
      <h2 className="text-xl font-bold">Change Password</h2>
      <input
        type="password"
        name="currentPassword"
        placeholder="Current Password"
        value={form.currentPassword}
        onChange={handleChange}
        className="w-full border px-3 py-2"
      />
      <input
        type="password"
        name="newPassword"
        placeholder="New Password"
        value={form.newPassword}
        onChange={handleChange}
        className="w-full border px-3 py-2"
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm New Password"
        value={form.confirmPassword}
        onChange={handleChange}
        className="w-full border px-3 py-2"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Change Password
      </button>
    </form>
  );
};

export default ChangePassword;
