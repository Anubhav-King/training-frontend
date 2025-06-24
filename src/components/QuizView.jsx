import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { BASE_URL } from "../utils/api";

const QuizView = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [topic, setTopic] = useState(null);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${BASE_URL}/api/topics/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTopic(res.data))
      .catch((err) => console.error("Failed to load quiz", err));
  }, [id]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlePopState = () => {
      if (!submitted) {
        alert("⚠️ You must submit the quiz before leaving!");
        navigate(0);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [submitted, navigate]);

  const handleSelect = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    const correctCount = topic.quiz.reduce(
      (acc, q, i) => acc + (q.correctAnswer === answers[i] ? 1 : 0),
      0,
    );
    const total = topic.quiz.length;
    const passed = correctCount === total;
    setFeedback(
      passed
        ? "✅ Topic Completed!"
        : `❌ You got ${correctCount}/${total} correct.`,
    );

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${BASE_URL}/api/progress`,
        {
          userId: user.userId,
          topicId: id,
          passed,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSubmitted(true);
      if (passed) {
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err) {
      console.error("Failed to submit progress", err);
    }
  };

  if (submitted && feedback.includes("✅")) return <Navigate to="/" />;

  if (!topic) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Quiz: {topic.title}</h2>
      {topic.quiz.map((q, idx) => (
        <div key={idx} className="mb-4">
          <p className="font-semibold">
            {idx + 1}. {q.question}
          </p>
          {q.options.map((opt, i) => (
            <label key={i} className="block ml-4">
              <input
                type="radio"
                name={`q${idx}`}
                value={opt}
                onChange={() => handleSelect(idx, opt)}
                checked={answers[idx] === opt}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      {feedback && (
        <div className="mt-4">
          <p
            className={`font-bold ${feedback.includes("✅") ? "text-green-600" : "text-red-600"}`}
          >
            {feedback}
          </p>
          {!feedback.includes("✅") && (
            <div className="mt-2 space-x-2">
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded"
                onClick={() => {
                  setAnswers({});
                  setFeedback("");
                  setSubmitted(false);
                }}
              >
                Retry Now
              </button>
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded"
                onClick={() => navigate("/")}
              >
                Retry Later
              </button>
            </div>
          )}
        </div>
      )}

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Quiz
        </button>
      )}
    </div>
  );
};

export default QuizView;
