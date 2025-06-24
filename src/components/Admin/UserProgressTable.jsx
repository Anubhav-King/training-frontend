import { useEffect, useState } from 'react';
import axios from 'axios';

const UserProgressTable = () => {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/progress/summary')
      .then(res => setSummary(res.data))
      .catch(err => console.error(err));
  }, []);

  if (summary.length === 0) {
    return <p>Loading progress data...</p>;
  }

  const topics = summary[0]?.topics.map(t => t.topicTitle) || [];

  return (
    <div className="bg-white p-6 rounded shadow mt-8 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">User Progress Summary</h2>
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2">User</th>
            {topics.map(title => (
              <th key={title} className="border px-4 py-2">{title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {summary.map(({ user, topics }, i) => (
            <tr key={i} className="group">
              <td className="border px-4 py-2">
                {user.fullName} <br/>
                <span className="text-sm text-gray-600">{user.mobile}</span>
              </td>
              {topics.map((t, j) => (
                <td key={j} className="border px-4 py-2 text-center">
                  {t.completed
                    ? <span className="text-green-600">✔️ ({t.attempts})</span>
                    : <span className="text-red-600">❌ ({t.attempts})</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserProgressTable;
