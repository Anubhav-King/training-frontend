import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/api";

const UpdateLogsModal = ({ onClose }) => {
  const [logs, setLogs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/topics/update-logs?page=${page}&limit=${PAGE_SIZE}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLogs(data.logs || []);
        setHasMore(page < data.totalPages);
      } catch (err) {
        console.error("Error fetching update logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-4xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-xl font-semibold mb-4">📘 Topic Update Logs</h2>
        <button onClick={onClose} className="absolute top-4 right-6 text-gray-500 hover:text-black text-xl">✖</button>

        {loading ? (
          <div className="text-center text-gray-600 py-12">🔄 Loading update logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center text-gray-600 py-12">No logs found.</div>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="border-b py-4">
              <p className="font-medium">
                ✅ <strong>{log.title}</strong> updated by <em>{log.updatedBy}</em> on{" "}
                {new Date(log.timestamp).toLocaleString()}
              </p>
              <button
                className="text-blue-600 hover:underline mt-1"
                onClick={() => toggleExpand(log._id)}
              >
                {expandedId === log._id ? "Hide Details" : "View Details"}
              </button>

              {expandedId === log._id && (
                <div className="mt-2 ml-4">
                  {log.updatedFields.content?.from !== log.updatedFields.content?.to && (
                    <div className="mb-3">
                      <p className="font-semibold text-gray-700">📝 Content Changed</p>
                      <details>
                        <summary className="cursor-pointer text-gray-600">Show Differences</summary>
                        <div className="mt-1 text-sm bg-gray-50 p-3 rounded border">
                          <strong>From:</strong>
                          <div
                            className="bg-red-50 p-2 rounded mt-1"
                            dangerouslySetInnerHTML={{ __html: log.updatedFields.content.from }}
                          />
                          <strong>To:</strong>
                          <div
                            className="bg-green-50 p-2 rounded mt-1"
                            dangerouslySetInnerHTML={{ __html: log.updatedFields.content.to }}
                          />
                        </div>
                      </details>
                    </div>
                  )}

                  {JSON.stringify(log.updatedFields.quiz?.from) !== JSON.stringify(log.updatedFields.quiz?.to) && (
                    <div>
                      <p className="font-semibold text-gray-700">🧠 Quiz Changed</p>
                      <details>
                        <summary className="cursor-pointer text-gray-600">Show Differences</summary>
                        <div className="mt-1 text-sm bg-gray-50 p-3 rounded border">
                          <pre className="whitespace-pre-wrap bg-red-50 p-2 rounded mb-2">
                            <strong>From:</strong>{" "}
                            {JSON.stringify(log.updatedFields.quiz.from, null, 2)}
                          </pre>
                          <pre className="whitespace-pre-wrap bg-green-50 p-2 rounded">
                            <strong>To:</strong>{" "}
                            {JSON.stringify(log.updatedFields.quiz.to, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        <div className="mt-6 flex justify-between items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="bg-gray-200 px-4 py-1 rounded disabled:opacity-50"
          >
            ⬅ Prev
          </button>
          <span className="text-gray-600">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="bg-gray-200 px-4 py-1 rounded disabled:opacity-50"
          >
            Next ➡
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateLogsModal;
