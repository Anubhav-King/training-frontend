import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/api";

const TopicAssigner = () => {
  const [topics, setTopics] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res1 = await axios.get(`${BASE_URL}/api/topics`, config);
      setTopics(res1.data);

      const res2 = await axios.get(`${BASE_URL}/api/users/list`, config);
      setUsers(res2.data);
    };

    fetchData();
  }, []);

  const handleAssign = async () => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const payload = { userId: selectedUser, topicId: selectedTopic };
    await axios.post(`${BASE_URL}/api/topics/assign`, payload, config);
    alert("Assigned!");
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Assign Topic</h2>

      <select
        onChange={(e) => setSelectedUser(e.target.value)}
        className="block mb-2"
      >
        <option value="">Select User</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name}
          </option>
        ))}
      </select>

      <select
        onChange={(e) => setSelectedTopic(e.target.value)}
        className="block mb-2"
      >
        <option value="">Select Topic</option>
        {topics.map((topic) => (
          <option key={topic._id} value={topic._id}>
            {topic.title}
          </option>
        ))}
      </select>

      <button
        onClick={handleAssign}
        disabled={!selectedUser || !selectedTopic}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Assign
      </button>
    </div>
  );
};

export default TopicAssigner;
