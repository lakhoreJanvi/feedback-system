import { useEffect, useState, useRef } from "react";
import axios from "../api/axios";
import { useAuth } from "../auth/authProvider";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkEmoji from "remark-emoji";

const EmployeeDashboard = () => {
  const feedbackRef = useRef(null);
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const { token } = useAuth();
  const [managerId, setManagerId] = useState("");
  const [managers, setManagers] = useState([]);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [comments, setComment] = useState("");

  const fetchFeedbacks = async () => {
    const res = await axios.get("/feedback/received");
    setFeedbacks(res.data);
  };

  const acknowledgeFeedback = async (id) => {
    try {
      await axios.post(`/feedback/${id}/acknowledge`);
      fetchFeedbacks();
    } catch (err) {
      alert("Failed to acknowledge feedback.");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await axios.get("/users/managers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setManagers(res.data);
      } catch (err) {
        console.error("Error fetching managers", err);
      }
    };

    fetchManagers();
  }, [token]);

  const handleRequestFeedback = async () => {
    try {
      await axios.post("/feedback/feedback-request/",
        { manager_id: managerId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequestSuccess(true);
      setManagerId("");
    } catch (err) {
      console.error("Error requesting feedback:", err);
      alert("Could not send request");
    }
  };

  const exportToPDF = () => {
    const input = feedbackRef.current;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("feedback_timeline.pdf");
    });
  };

  const handleCommentChange = (id, value) => {
    setComment((prev) => ({ ...prev, [id]: value }));
  };

  const handleCommentSubmit = async(feedbackId) => {
    const commentText = comments[feedbackId]?.trim();
    if (!commentText) {
      alert("Comment cannot be empty.");
      return;
    }
    try{
      await axios.post(`/feedback/${feedbackId}/comment`, {comments: comments[feedbackId] || "",});
      alert("Comment Submitted!");
      setComment((prev) => ({ ...prev, [feedbackId]: "" }));
      fetchFeedbacks();
    } catch (error){
      alert("Failed to submit feedback.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Employee Dashboard</h2>
      <div className="border p-4 my-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Request Feedback</h3>
        <select className="border p-2 rounded" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
          <option value="">Select a Manager</option>
          {managers.map((manager) => (
            <option key={manager.id} value={manager.id}>
              {manager.name || manager.email}
            </option>
          ))}
        </select>
        <button
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleRequestFeedback} disabled={!managerId}>Send Request
        </button>
        {requestSuccess && (
          <p className="text-green-600 mt-2">Feedback request sent!</p>
        )}
      </div>
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Feedback Timeline</h3>
          <button onClick={exportToPDF} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Export as PDF
          </button>
        </div>

        <div ref={feedbackRef}>
        {feedbacks.length === 0 ? (
          <p className="text-gray-500 italic">No feedback received yet.</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="text-sm text-gray-500">
                  📅 {new Date(fb.created_at).toLocaleDateString()} &nbsp; | &nbsp; 🧑 From: {fb.manager?.name || "Unknown"}
                </div>
                <p className="mb-1">
                  <span className="font-semibold text-green-700">Strengths:</span>{" "}
                  {fb.strengths}
                </p>
                <p className="mb-1">
                  <span className="font-semibold text-yellow-700">Improvements:</span>{" "}
                  {fb.improvements}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Sentiment:</span>{" "}
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                      fb.sentiment === "positive"
                        ? "bg-green-100 text-green-800"
                        : fb.sentiment === "neutral"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {fb.sentiment}
                  </span>
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Status:</span>{" "}
                  {fb.acknowledged ? (
                    <span className="text-green-600">✅ Acknowledged</span>
                  ) : (
                    <span className="text-red-600">❌ Not Acknowledged</span>
                  )}
                </p>
                {!fb.acknowledged && (
                  <button
                    onClick={() => acknowledgeFeedback(fb.id)}
                    className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                  >
                    Acknowledge
                  </button>
                )}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Add a Comment:
                  </label>
                  <textarea
                    className="w-full p-2 mt-1 border border-gray-300 rounded"
                    rows="2"
                    value={comments[fb.id] || ""}
                    onChange={(e) => handleCommentChange(fb.id, e.target.value)}
                  ></textarea>
                  <div className="border p-2 mt-2 bg-gray-100 rounded">
                    <p className="text-xs font-semibold mb-1">Markdown Preview:</p>
                    <ReactMarkdown remarkPlugins={[remarkGfm,remarkEmoji]}>{comments[fb.id] || ""}</ReactMarkdown>
                  </div>
                  <button
                    className="mt-2 px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    onClick={() => handleCommentSubmit(fb.id)}
                  >
                    Submit Comment
                  </button>
                </div>

                {fb.comments && fb.comments.length > 0 && (
                  <div className="mt-4 text-sm text-gray-700">
                    💬 <strong>Comments:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {fb.comments.map((comment) => (
                        <li key={comment.id} className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-1">
                          <span className="text-lg leading-none">•</span>
                          <ReactMarkdown remarkPlugins={[remarkGfm,remarkEmoji]}>{comment.comments}</ReactMarkdown>
                          </div>
                          <span className="text-gray-500 text-xs">
                            ({new Date(comment.created_at + "Z").toLocaleString("en-US", {
                              timeZone: "Asia/Kolkata",
                              dateStyle: "medium",
                              timeStyle: "short",
                            })})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>  
            ))}
          </div>
        )}
          </div>
      </section>
    </div>
  );
};

export default EmployeeDashboard;
