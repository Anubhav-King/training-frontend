import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/api";

const UserProgressTable = () => {
  const [progressData, setProgressData] = useState([]);
  const [modalUser, setModalUser] = useState(null);
  const [details, setDetails] = useState([]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const res = await axios.get(`${BASE_URL}/api/progress/summary`, config);
      setProgressData(res.data);
    } catch (err) {
      console.error("Failed to load summary:", err);
    }
  };

  const openModal = async (user) => {
    setModalUser(user);
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const res = await axios.get(`${BASE_URL}/api/progress/user/${user.userId}/details`, config);
      setDetails(res.data);
    } catch (err) {
      console.error("Failed to fetch details:", err);
    }
  };

  const closeModal = () => {
    setModalUser(null);
    setDetails([]);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">User Progress Summary</h2>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Job Titles</th>
            <th className="border px-2 py-1">Assigned Topics</th>
            <th className="border px-2 py-1">Completed</th>
            <th className="border px-2 py-1">Details</th>
          </tr>
        </thead>
        <tbody>
          {progressData.map((user, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{user.name}</td>
              <td className="border px-2 py-1">{(user.jobTitles || []).join(", ")}</td>
              <td className="border px-2 py-1 text-center">{user.assignedCount}</td>
              <td className="border px-2 py-1 text-center">{user.completedCount}</td>
              <td className="border px-2 py-1 text-center">
                <button
                  onClick={() => openModal(user)}
                  className="text-blue-600 underline"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Modal Popup */}
      {modalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Topic Attempts for {modalUser.name}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-black"
              >
                ✖
              </button>
            </div>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Topic</th>
                  <th className="border px-2 py-1">Attempts</th>
                  <th className="border px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {details.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">
                      No Topics Assigned
                    </td>
                  </tr>
                ) : (
                  details.map((item, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{item.title}</td>
                      <td className="border px-2 py-1 text-center">{item.attempts}</td>
                      <td className="border px-2 py-1 text-center">
                        {item.completed ? "✅" : "❌"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
            <div className="mt-4 text-right">
              <button
                onClick={closeModal}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProgressTable;
