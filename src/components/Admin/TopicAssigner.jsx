import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/api";
import { JOB_TITLES_WITH_ALL_OPTION } from "../../constants/jobTitles";

const formatDateTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleString("en-GB");
};

const TopicAssigner = () => {
  const [activeTab, setActiveTab] = useState("unassigned");
  const [unassignedTopics, setUnassignedTopics] = useState([]);
  const [assignedTopics, setAssignedTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedJobTitles, setSelectedJobTitles] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [topicMessages, setTopicMessages] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchUnassigned, setUserSearchUnassigned] = useState("");

  const [logsByTopic, setLogsByTopic] = useState({});
  const [showLogs, setShowLogs] = useState({});
  const [showUnassignedLogs, setShowUnassignedLogs] = useState(false);
  const [editedAssignments, setEditedAssignments] = useState({});

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };


  // For Unassigned Logs Modal
  const [searchUnassignedLogs, setSearchUnassignedLogs] = useState("");
  const [unassignedLogPages, setUnassignedLogPages] = useState({});

  // For Assigned Logs Modal
  const [assignedLogPages, setAssignedLogPages] = useState({});

  const fetchTopics = async () => {
    try {
      const [unassigned, assigned] = await Promise.all([
        axios.get(`${BASE_URL}/api/topics/unassigned`, config),
        axios.get(`${BASE_URL}/api/topics/assigned`, config),
      ]);
      setUnassignedTopics(unassigned.data);
      setAssignedTopics(assigned.data);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/list`, config);
      setAllUsers(res.data.filter(u => u.active));
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchLogsForTopic = async (topicId) => {
    if (logsByTopic[topicId]) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/topics/logs/${topicId}`, config);
      setLogsByTopic(prev => ({ ...prev, [topicId]: res.data[topicId] }));
    } catch (err) {
      console.error("Failed to fetch topic logs:", err);
    }
  };

  const fetchUnassignedLogs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/topics/unassigned/logs`, config);
      setLogsByTopic(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error("Failed to fetch unassigned logs:", err);
    }
  };


  useEffect(() => {
    fetchTopics();
    fetchUsers();
  }, []);

  const handleCheckboxChange = (jobTitle) => {
    setSelectedJobTitles(prev =>
      prev.includes(jobTitle)
        ? prev.filter(j => j !== jobTitle)
        : [...prev, jobTitle]
    );
  };

  const handleUserSelect = (e) => {
    const value = e.target.value;
    setSelectedUsers(prev =>
      prev.includes(value)
        ? prev.filter(u => u !== value)
        : [...prev, value]
    );
  };

  const filteredUsersUnassigned = allUsers.filter(user =>
    user.name.toLowerCase().includes(userSearchUnassigned.toLowerCase()) ||
    user.jobTitles.join(" ").toLowerCase().includes(userSearchUnassigned.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedTopic || (selectedJobTitles.length === 0 && selectedUsers.length === 0)) {
      setMessage("Please select a topic and at least one job title or user.");
      return;
    }

    try {
      for (let jobTitle of selectedJobTitles) {
        await axios.post(`${BASE_URL}/api/topics/assign`, { topicId: selectedTopic, jobTitle }, config);
      }
      for (let userId of selectedUsers) {
        await axios.post(`${BASE_URL}/api/topics/assign`, { topicId: selectedTopic, userId }, config);
      }

      setMessage("✅ Topic assigned successfully.");
      setSelectedJobTitles([]);
      setSelectedUsers([]);
      setSelectedTopic("");
      setUserSearchUnassigned("");
      fetchTopics();
      await fetchLogsForTopic(topicId);
      setShowLogs(prev => ({ ...prev, [topicId]: true }));
    } catch (err) {
      console.error("Error assigning topic:", err);
      setMessage("❌ Failed to assign topic.");
    }
  };

  const handleEditToggle = (topic) => {
    const isEditing = editingTopicId === topic._id;

    if (!isEditing) {
      setEditingTopicId(topic._id);
      setEditedAssignments(prev => ({
        ...prev,
        [topic._id]: {
          jobTitles: topic.jobTitles || [],
          users: topic.assignedTo || [],
        }
      }));
    } else {
      setEditingTopicId(null);
    }
  };

  const toggleEditJobTitle = (topicId, title) => {
    setEditedAssignments(prev => {
      const topicEdits = prev[topicId] || { jobTitles: [], users: [] };
      const updatedJobTitles = topicEdits.jobTitles.includes(title)
        ? topicEdits.jobTitles.filter(j => j !== title)
        : [...topicEdits.jobTitles, title];
      return {
        ...prev,
        [topicId]: { ...topicEdits, jobTitles: updatedJobTitles }
      };
    });
  };

  const toggleEditUser = (topicId, userId) => {
    setEditedAssignments(prev => {
      const topicEdits = prev[topicId] || { jobTitles: [], users: [] };
      const updatedUsers = topicEdits.users.includes(userId)
        ? topicEdits.users.filter(id => id !== userId)
        : [...topicEdits.users, userId];
      return {
        ...prev,
        [topicId]: { ...topicEdits, users: updatedUsers }
      };
    });
  };

  const saveAssignments = async (topic) => {
    try {
      const topicId = topic._id;
      const edited = editedAssignments[topicId];

      const originalJobTitles = [...new Set(topic.jobTitles)];
      const originalUsers = [...new Set(topic.assignedTo.map(id => id.toString()))];

      const editedJobTitles = [...new Set(edited.jobTitles)];
      const editedUserIds = [...new Set(edited.users.map(String))];

      const jobTitlesToAdd = editedJobTitles.filter(j => !originalJobTitles.includes(j));
      const jobTitlesToRemove = originalJobTitles.filter(j => !editedJobTitles.includes(j));
      const usersToAdd = editedUserIds.filter(id => !originalUsers.includes(id));
      const usersToRemove = originalUsers.filter(id => !editedUserIds.includes(id));

      //console.log("💡 Saving changes for topic:", topic.title);
      //console.log("Job Titles to Add:", jobTitlesToAdd);
      //console.log("Job Titles to Remove:", jobTitlesToRemove);
      //console.log("Users to Add:", usersToAdd);
      //console.log("Users to Remove:", usersToRemove);

      for (let jobTitle of jobTitlesToAdd) {
        const res = await axios.post(`${BASE_URL}/api/topics/assign`, { topicId, jobTitle }, config);
        //console.log(`✅ Assigned job title ${jobTitle}:`, res.data);
      }
      for (let jobTitle of jobTitlesToRemove) {
        const res = await axios.post(`${BASE_URL}/api/topics/unassign`, { topicId, jobTitle }, config);
        //console.log(`✅ Unassigned job title ${jobTitle}:`, res.data);
      }
      for (let userId of usersToAdd) {
        const res = await axios.post(`${BASE_URL}/api/topics/assign`, { topicId, userId }, config);
        //console.log(`✅ Assigned user ${userId}:`, res.data);
      }
      for (let userId of usersToRemove) {
        const res = await axios.post(`${BASE_URL}/api/topics/unassign`, { topicId, userId }, config);
        //console.log(`✅ Unassigned user ${userId}:`, res.data);
      }

      // Clear editing state
      setEditingTopicId(null);
      setEditedAssignments(prev => {
        const copy = { ...prev };
        delete copy[topicId];
        return copy;
      });

      await fetchTopics();

      //console.log("🔍 Fetching updated logs...");
      const res = await axios.get(`${BASE_URL}/api/topics/logs/${topicId}`, config);
      //console.log("📋 Updated Logs Fetched:", res.data);

      setLogsByTopic(prev => ({ ...prev, [topicId]: res.data[topicId] }));
    } catch (err) {
      console.error("❌ Failed to save assignment changes:", err);
    }
  };




  return (
    <div className="p-4 max-w-4xl mx-auto bg-white rounded shadow">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab("unassigned")}
          className={`px-4 py-2 rounded ${activeTab === "unassigned" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Unassigned Topics
        </button>
        <button
          onClick={() => setActiveTab("assigned")}
          className={`px-4 py-2 rounded ${activeTab === "assigned" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Assigned Topics
        </button>
      </div>

      {/* Unassigned Topics Tab */}
      {activeTab === "unassigned" && (
        <>
          <h2 className="text-xl font-bold mb-4">Assign Topic</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium">Select Topic:</label>
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            >
              <option value="">-- Select Topic --</option>
              {unassignedTopics.map((topic) => (
                <option key={topic._id} value={topic._id}>{topic.title}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Select Job Titles:</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {JOB_TITLES_WITH_ALL_OPTION.map((title) => (
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

          <div className="mb-4">
            <label className="block text-sm font-medium">Assign to Individual Users:</label>
            <input
              type="text"
              placeholder="Search users..."
              value={userSearchUnassigned}
              onChange={(e) => setUserSearchUnassigned(e.target.value)}
              className="w-full mb-2 border p-2 rounded"
            />
            <div className="h-32 overflow-auto border rounded p-2">
              <div className="grid grid-cols-2 gap-2">
                {filteredUsersUnassigned.map(user => (
                  <label key={user._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleUserSelect({ target: { value: user._id } })}
                    />
                    <span>{user.name} [{user.jobTitles.join(", ")}]</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleAssign}
            disabled={!selectedTopic || (selectedJobTitles.length === 0 && selectedUsers.length === 0)}
            className={`px-4 py-2 rounded ${
              !selectedTopic || (selectedJobTitles.length === 0 && selectedUsers.length === 0)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Assign Topic
          </button>

          {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}

          <div className="mt-8">
            <button
              onClick={() => {
                fetchUnassignedLogs();
                setShowUnassignedLogs(true);
              }}
              className="text-blue-600 underline text-sm"
            >
              View Logs of Fully Unassigned Topics
            </button>

            {showUnassignedLogs && (
              <Modal onClose={() => setShowUnassignedLogs(false)}>
                <h3 className="text-lg font-bold mb-2">Unassigned Topic Logs</h3>
                <input
                  type="text"
                  value={searchUnassignedLogs}
                  onChange={(e) => setSearchUnassignedLogs(e.target.value)}
                  placeholder="Search topic name..."
                  className="border p-1 w-full mb-2 rounded"
                />
                <div className="space-y-4 max-h-[60vh] overflow-auto">
                  {Object.entries(logsByTopic)
                    .filter(([tid]) => unassignedTopics.some(t => t._id === tid && t.title.toLowerCase().includes(searchUnassignedLogs.toLowerCase())))
                    .map(([tid, logs]) => {
                      const topic = unassignedTopics.find(t => t._id === tid);
                      return (
                        <div key={tid} className="border p-3 rounded">
                          <h4 className="font-bold text-lg mb-1">{topic?.title || "Untitled"}</h4>
                          <LogSections
                            logs={logs}
                            allUsers={allUsers}
                            formatDateTime={formatDateTime}
                            jobPage={(unassignedLogPages[tid] || {}).jobPage || 1}
                            userPage={(unassignedLogPages[tid] || {}).userPage || 1}
                            setJobPage={(pg) =>
                              setUnassignedLogPages(prev => ({
                                ...prev,
                                [tid]: { ...prev[tid], jobPage: pg }
                              }))
                            }
                            setUserPage={(pg) =>
                              setUnassignedLogPages(prev => ({
                                ...prev,
                                [tid]: { ...prev[tid], userPage: pg }
                              }))
                            }
                          />

                        </div>
                      );
                    })}
                </div>
              </Modal>
            )}
          </div>
        </>
      )}

      {/* Assigned Topics Tab */}
      {activeTab === "assigned" && (
        <>
          <h2 className="text-xl font-bold mb-4">Assigned Topics</h2>
          {assignedTopics.map((topic) => {
            const isEditing = editingTopicId === topic._id;
            const logs = logsByTopic[topic._id] || {};
            const edited = editedAssignments[topic._id] || { jobTitles: [], users: [] };

            return (
              <div key={topic._id} className="border p-4 rounded mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{topic.title}</h3>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveAssignments(topic)}
                          className="text-green-600 text-sm underline"
                        >
                          Done
                        </button>
                        <button
                          onClick={() => setEditingTopicId(null)}
                          className="text-gray-600 text-sm underline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEditToggle(topic)}
                        className="text-blue-600 text-sm underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {JOB_TITLES_WITH_ALL_OPTION.map((title) => (
                        <label key={title} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={edited.jobTitles.includes(title)}
                            onChange={() => toggleEditJobTitle(topic._id, title)}
                          />
                          <span>{title}</span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-1">Assigned to Users:</label>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        {allUsers.map((user) => (
                          <label key={user._id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={edited.users.includes(user._id)}
                              onChange={() => toggleEditUser(topic._id, user._id)}
                            />
                            <span>{user.name} [{user.jobTitles.join(", ")}]</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-700 mb-2">
                    Job Titles: {topic.jobTitles.join(", ") || "None"} <br />
                    Users: {allUsers.filter(u => topic.assignedTo.includes(u._id)).map(u => u.name).join(", ") || "None"}
                  </div>
                )}

                <button
                  onClick={() => {
                    fetchLogsForTopic(topic._id);
                    setShowLogs(prev => ({ ...prev, [topic._id]: !prev[topic._id] }));
                  }}
                  className="text-purple-600 mt-2 text-sm underline"
                >
                  {showLogs[topic._id] ? "Hide Logs" : "View Logs"}
                </button>

                {showLogs[topic._id] && (
                  <Modal onClose={() => setShowLogs(prev => ({ ...prev, [topic._id]: false }))}>
                    <h3 className="text-lg font-bold mb-2">{topic.title} - Logs</h3>
                    <LogSections
                      logs={logs}
                      allUsers={allUsers}
                      formatDateTime={formatDateTime}
                      jobPage={(assignedLogPages[topic._id] || {}).jobPage || 1}
                      userPage={(assignedLogPages[topic._id] || {}).userPage || 1}
                      setJobPage={(pg) =>
                        setAssignedLogPages(prev => ({
                          ...prev,
                          [topic._id]: { ...prev[topic._id], jobPage: pg }
                        }))
                      }
                      setUserPage={(pg) =>
                        setAssignedLogPages(prev => ({
                          ...prev,
                          [topic._id]: { ...prev[topic._id], userPage: pg }
                        }))
                      }
                    />

                  </Modal>
                )}

              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

const LogSections = ({
  logs,
  allUsers = [],
  formatDateTime,
  jobPage = 1,
  userPage = 1,
  setJobPage,
  setUserPage,
  logsPerPage = 5,
}) => {
  const userLogs = logs.userLogs || [];
  const jobLogs = logs.jobTitleLogs || [];

  const paginated = (arr, pg) => arr.slice((pg - 1) * logsPerPage, pg * logsPerPage);

  return (
    <>
      <div className="text-sm mb-4">
        <h4 className="font-bold text-blue-700 mb-1">Job Title Logs</h4>
        <ul className="list-disc pl-5 mb-2">
          {jobLogs.length > 0 ? (
            paginated(jobLogs, jobPage).map((log, i) => (
              <li key={i}>
                {log.action} <strong>{log.jobTitle}</strong> by {log.adminName} on {formatDateTime(log.timestamp)}
              </li>
            ))
          ) : (
            <li>No job title logs</li>
          )}
        </ul>
        {jobLogs.length > logsPerPage && (
          <Pagination total={jobLogs.length} current={jobPage} setPage={setJobPage} />
        )}
      </div>

      <div className="text-sm">
        <h4 className="font-bold text-green-700 mb-1">User Logs</h4>
        <ul className="list-disc pl-5 mb-2">
          {userLogs.length > 0 ? (
            paginated(userLogs, userPage).map((log, i) => {
              const user = allUsers.find(u => u._id === log.userId);
              return (
                <li key={i}>
                  {log.action} user <strong>{user ? user.name : `ID ${log.userId}`}</strong> by {log.adminName} on {formatDateTime(log.timestamp)}
                </li>
              );
            })
          ) : (
            <li>No user logs</li>
          )}
        </ul>
        {userLogs.length > logsPerPage && (
          <Pagination total={userLogs.length} current={userPage} setPage={setUserPage} />
        )}
      </div>
    </>
  );
};

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
    <div className="bg-white rounded-lg p-4 max-w-xl w-full shadow-lg relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-600">✖</button>
      {children}
    </div>
  </div>
);

const Pagination = ({ total, current, setPage }) => {
  const totalPages = Math.ceil(total / 5);
  return (
    <div className="flex justify-center gap-2 mt-2">
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => setPage(i + 1)}
          className={`px-2 py-1 rounded ${current === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default TopicAssigner;
