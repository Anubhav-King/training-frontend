import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/api";

const UserProgressTable = () => {
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios
      .get(`${BASE_URL}/api/progress/summary`, config)
      .then((res) => setProgressData(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">User Progress</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Topic</th>
            <th className="border px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {progressData.map((entry, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{entry.userName}</td>
              <td className="border px-2 py-1">{entry.topicTitle}</td>
              <td className="border px-2 py-1">{entry.passed ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserProgressTable;
