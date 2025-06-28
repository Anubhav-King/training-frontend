import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ImagePreviewModal from "../common/ImagePreviewModal";

const sections = ["Objective", "Process Explained", "Task Breakdown", "Self Check"];

const sectionKeyMap = {
  Objective: "objective",
  "Process Explained": "process",
  "Task Breakdown": "task",
  "Self Check": "selfCheck",
};

const TopicImageUploader = () => {
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedSection, setSelectedSection] = useState(sections[0]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // key: file.name, value: percentage
  const [previewIndex, setPreviewIndex] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const dropdownRef = useRef(null);

  // Fetch all topics on mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/topics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTopics(res.data);
      } catch (err) {
        console.error("Failed to load topics", err);
      }
    };
    fetchTopics();
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredTopics = topics.filter(
    (topic) => topic.title && topic.title.toLowerCase().includes(search.toLowerCase())
  );


  // Delete image from section
  const handleDeleteImage = async (topicId, section, url) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      const token = localStorage.getItem("token");

      // Fetch current topic images from backend to update array without deleted url
      const topicRes = await axios.get(`${BASE_URL}/api/topics/${topicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const topic = topicRes.data;

      // Remove URL from the correct section array
      const key = sectionKeyMap[section];
      if (!key) return;

      const updatedImages = (topic.images && topic.images[key])
        ? topic.images[key].filter((imgUrl) => imgUrl !== url)
        : [];

      // PATCH updated array back to backend
      await axios.patch(
        `${BASE_URL}/api/topics/${topicId}/images`,
        {
          section,
          urls: updatedImages,
          replace: true, // indicate replace, not append (backend needs to support this)
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update frontend state after delete
      setTopics((prev) =>
        prev.map((t) =>
          t._id === topicId
            ? {
                ...t,
                images: {
                  ...t.images,
                  [key]: updatedImages,
                },
              }
            : t
        )
      );
    } catch (err) {
      console.error("Failed to delete image", err);
      alert("Failed to delete image");
    }
  };

  // Upload images button handler
  const handleUploadClick = async () => {
    if (!selectedTopicId) return alert("Please select a topic");
    if (uploadFiles.length === 0) return alert("Please select image(s) to upload");

    setLoading(true);
    const uploadedUrls = [];
    const progressMap = {};

    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "unsigned_topic_uploads");
        formData.append(
          "folder",
          `topics/${selectedTopicId}/${selectedSection.toLowerCase().replace(/\s/g, "_")}`
        );

        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dwwkeitzv/image/upload",
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              progressMap[file.name] = percent;
              setUploadProgress({ ...progressMap });
            },
          }
        );

        uploadedUrls.push(res.data.secure_url);
      }

      const token = localStorage.getItem("token");
      await axios.patch(
        `${BASE_URL}/api/topics/${selectedTopicId}/images`,
        {
          section: selectedSection,
          urls: uploadedUrls,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const key = sectionKeyMap[selectedSection];
      setTopics((prev) =>
        prev.map((t) =>
          t._id === selectedTopicId
            ? {
                ...t,
                images: {
                  ...t.images,
                  [key]: [...(t.images?.[key] || []), ...uploadedUrls],
                },
              }
            : t
        )
      );

      alert(`Uploaded ${uploadedUrls.length} image(s) to ${selectedSection}`);
      setUploadFiles([]);
      setUploadProgress({});
      document.getElementById("image-upload-input").value = "";
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload images");
    } finally {
      setLoading(false);
    }
  };


  const handleDragEnd = async (result) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) return;

    const key = sectionKeyMap[selectedSection];
    const currentImages = topics.find((t) => t._id === selectedTopicId)?.images?.[key] || [];
    const reordered = Array.from(currentImages);

    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    // Update backend
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BASE_URL}/api/topics/${selectedTopicId}/images`,
        {
          section: selectedSection,
          urls: reordered,
          replace: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setTopics((prev) =>
        prev.map((t) =>
          t._id === selectedTopicId
            ? {
                ...t,
                images: {
                  ...t.images,
                  [key]: reordered,
                },
              }
            : t
        )
      );
    } catch (err) {
      console.error("Failed to reorder images", err);
      alert("Failed to update image order");
    }
  };


  return (
    <div className={`p-4 max-w-2xl mx-auto relative ${loading ? "pointer-events-none opacity-50" : ""}`}>
      <h2 className="text-xl font-bold mb-4">🖼 Upload Images to Topic Sections</h2>

      {/* Dropdown with search */}
      <div className="relative mb-4" ref={dropdownRef}>
        <button
          className="w-full border px-3 py-2 rounded text-left disabled:bg-gray-100"
          onClick={() => setDropdownOpen((open) => !open)}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          disabled={loading}
        >
          {selectedTopicId
            ? topics.find((t) => t._id === selectedTopicId)?.title || "Select a topic"
            : "Select a topic"}
          <span className="float-right">&#9662;</span>
        </button>

        {dropdownOpen && (
          <div className="absolute z-10 w-full max-h-60 overflow-auto border rounded bg-white shadow mt-1">
            <input
              type="text"
              placeholder="🔍 Search topics..."
              className="w-full px-3 py-2 border-b"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ul
              className="max-h-48 overflow-auto"
              role="listbox"
              aria-label="Topics list"
            >
              {filteredTopics.length === 0 && (
                <li className="p-2 text-gray-500">No topics found</li>
              )}
              {filteredTopics.map((topic) => (
                <li
                  key={topic._id}
                  role="option"
                  tabIndex={0}
                  className={`cursor-pointer px-3 py-2 hover:bg-blue-200 ${
                    topic._id === selectedTopicId ? "bg-blue-300 font-semibold" : ""
                  }`}
                  onClick={() => {
                    setSelectedTopicId(topic._id);
                    setDropdownOpen(false);
                    setSearch("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSelectedTopicId(topic._id);
                      setDropdownOpen(false);
                      setSearch("");
                    }
                  }}
                >
                  {topic.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Section selector */}
      <div className="flex gap-2 mb-4">
        {sections.map((section) => (
            <button
              key={section}
              className={`px-3 py-1 rounded border disabled:opacity-50 ${
                selectedSection === section
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setSelectedSection(section)}
              disabled={loading}
            >
            {section}
          </button>
        ))}
      </div>

      {/* Current images display with delete */}
      {selectedTopicId && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">
            Current images in "{selectedSection}" section:
          </h3>
          <DragDropContext onDragEnd={loading ? () => {} : handleDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <div
                  className="flex flex-wrap gap-3"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {(topics.find((t) => t._id === selectedTopicId)?.images?.[
                    sectionKeyMap[selectedSection]
                  ] || []).map((url, index) => (
                    <Draggable key={url} draggableId={url} index={index}>
                      {(provided) => (
                        <div
                          className="relative border rounded overflow-hidden w-28 h-28 flex-shrink-0"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <img
                            src={url}
                            alt="Topic Section"
                            className="object-cover w-full h-full cursor-pointer"
                            onClick={() => {
                              const key = sectionKeyMap[selectedSection];
                              const images = topics.find(t => t._id === selectedTopicId)?.images?.[key] || [];
                              setPreviewImages(images);
                              setPreviewIndex(index);
                            }}
                          />

                          <button
                            onClick={() =>
                              handleDeleteImage(selectedTopicId, selectedSection, url)
                            }
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                            title="Delete image"
                            type="button"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* Upload input + button */}
      <div className="flex items-center gap-2">
        <input
          id="image-upload-input"
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setUploadFiles(Array.from(e.target.files))}
          disabled={loading}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={handleUploadClick}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
      {uploadFiles.length > 0 && (
        <div className="mt-4 w-full">
          {uploadFiles.map((file) => (
            <div key={file.name} className="mb-2">
              <div className="text-sm text-gray-700 mb-1">{file.name}</div>
              <div className="w-full h-2 bg-gray-200 rounded">
                <div
                  className="h-full bg-blue-500 rounded"
                  style={{ width: `${uploadProgress[file.name] || 0}%` }}
                />
              </div>
              <div className="text-xs text-right text-gray-600">
                {uploadProgress[file.name] || 0}%
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}
      <ImagePreviewModal
        images={previewImages}
        index={previewIndex}
        onClose={() => setPreviewIndex(null)}
      />
    </div>
  );
};

export default TopicImageUploader;
