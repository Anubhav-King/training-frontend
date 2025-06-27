import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { BASE_URL } from '../utils/api';
import UpdateLogsModal from './UpdateLogsModal';

const AdminPanel = () => {
  const [showLogs, setShowLogs] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDownloadCSV = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/api/topics/csv/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "topics.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV download error:", err);
      alert("❌ Failed to download topics CSV");
    }
  };

  const handleUploadCSV = () => {
    if (!file) return alert("⚠️ Please select a CSV file first.");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/api/topics/csv/import`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onloadstart = () => {
      setUploading(true);
      setProgress(0);
    };

    xhr.onloadend = () => {
      setUploading(false);
      setProgress(0);
      setFile(null);
    };

    xhr.onload = () => {
      const response = JSON.parse(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) {
        alert(`✅ ${response.updated} topic(s) processed successfully!`);
      } else {
        alert("❌ Upload failed: " + (response.error || "Unknown error"));
      }
    };

    xhr.onerror = () => {
      alert("❌ Upload failed due to network error.");
    };

    xhr.send(formData);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  return (
    <div
      className={`bg-white p-6 rounded shadow relative transition-opacity duration-300 ${
        uploading ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <p className="mb-6">Welcome, Admin! Use the tools below to manage training content and users.</p>

      <div className="flex flex-col gap-4 max-w-sm">
        <Link
          to="/admin/users"
          className="bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700 transition"
        >
          👥 Manage Users
        </Link>

        <Link
          to="/admin/assign-topics"
          className="bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700 transition"
        >
          🗂 Assign Topics to Users or Roles
        </Link>

        <Link
          to="/admin/progress"
          className="bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700 transition"
        >
          📊 View User Progress Summary
        </Link>

        <button
          onClick={handleDownloadCSV}
          className="bg-yellow-600 text-white px-4 py-2 rounded text-center hover:bg-yellow-700 transition"
          disabled={uploading}
        >
          ⬇️ Download Topics CSV
        </button>

        {/* Upload CSV Section */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
            disabled={uploading}
          >
            📁 Choose CSV
          </button>
          <span className="text-sm text-gray-700 truncate w-40">
            {file?.name || "No file selected"}
          </span>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleUploadCSV}
            className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 transition"
            disabled={uploading}
          >
            ⬆️ Upload
          </button>
        </div>

        {/* Progress bar */}
        {uploading && (
          <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
            <div
              className="bg-indigo-600 h-4 text-xs text-white text-center transition-all duration-200"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
        )}

        <button
          onClick={() => setShowLogs(true)}
          className="bg-gray-800 text-white px-4 py-2 rounded text-center hover:bg-gray-900 transition"
          disabled={uploading}
        >
          📘 View Topic Update Logs
        </button>
      </div>

      {showLogs && <UpdateLogsModal onClose={() => setShowLogs(false)} />}
    </div>
  );
};

export default AdminPanel;
