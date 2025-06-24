import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/api";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [mobile, setEmail] = useState("");

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await axios.get(`${BASE_URL}/api/users/list`, config);
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async () => {
    const form = { name, mobile };
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.post(`${BASE_URL}/api/users/add-user`, form, config);
    fetchUsers();
  };

  const handleDeactivate = async (userId) => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.post(
      `${BASE_URL}/api/users/deactivate-user`,
      { userId },
      config,
    );
    fetchUsers();
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">User Manager</h2>

      <input
        type="text"
        placeholder="Name"
        className="block my-1"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="mobile"
        placeholder="Mobile"
        className="block my-1"
        value={mobile}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleAdd}
        className="bg-green-600 text-white px-3 py-1 rounded mb-4"
      >
        Add User
      </button>

      <ul>
        {users.map((user) => (
          <li key={user._id} className="mb-2">
            {user.name} ({user.mobile}){" "}
            <button
              onClick={() => handleDeactivate(user._id)}
              className="text-red-600 ml-2"
            >
              Deactivate
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManager;
