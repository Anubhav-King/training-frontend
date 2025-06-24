import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/api";

const JOB_TITLES = [
  "Manager",
  "Staff",
  "Admin",
  "HR",
  "Technician",
  "Supervisor",
  "Intern"
];

const TopicAssigner = () => {
  const [topics, setTopics] = useState([]);
  const [selectedJobTitles, setSelectedJobTitles] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTopics = async () => {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const res = await axios.get(`${BASE_URL}/api/topics/unassigned`, config);
        setTopics(res.data);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      }
    };

    fetchTopics();
  }, []);

  const handleCheckboxChange = (jobTitle) => {
    setSelectedJobTitles(prev =>
      prev.includes(jobTitle)
        ? prev.filter(j => j !== jobTitle)
        : [...prev, jobTitle]
    );
  };

  const handleAssign = async () => {
    if (!selectedTopic || selectedJobTitles.length === 0) {
      setMessage("Please select a topic and at least one job title.");
      return;
    }

    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      for (let jobTitle of selectedJobTitles) {
        await axios.post(`${BASE_URL}/api/topics/assign`, {
          topicId: selectedTopic,
          jobTitle
        }, config);
      }
      setMessage(`✅ Topic assigned to: ${selectedJobTitles.join(", ")}`);
    } catch (err) {
      console.error("Error assigning topic:", err);
      setMessage("❌ Failed to assign topic.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Assign Topic to Job Titles</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">Select Topic:</label>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded p-2"
        >
          <option value="">-- Select Topic --</option>
          {topics.map((topic) => (
            <option key={topic._id} value={topic._id}>
              {topic.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Select Job Titles:</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {JOB_TITLES.map((title) => (
            <label key={title} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedJobTitles.includes(title)}
                onChange={() => handleCheckboxChange(title)}
              />
              <span>{title}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleAssign}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Assign Topic
      </button>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default TopicAssigner;
