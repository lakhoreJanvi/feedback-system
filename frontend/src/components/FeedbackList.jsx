import { useEffect, useState } from "react";
import API from "../api/axios";
import AcknowledgeButton from "./AcknowledgeButton";
import { useAuth } from "../auth/authProvider";

const FeedbackList = ({ type, onEdit = () => {} }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const endpoint = type === "given" ? "/feedback/given" : "/feedback/received";
    API.get(endpoint).then((res) => {
      setFeedbacks(res.data);
    });
  }, [type]);

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-400">Feedback count: {feedbacks.length}</div>
      {Array.isArray(feedbacks) && feedbacks.length === 0 ? (
        <p className="text-gray-500 italic">No feedbacks available.</p>
      ) : (
        feedbacks.map((fb) => (
          <div key={fb.id} className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">To:</span> {fb.employee?.name || fb.employee?.email || "Unknown"}{" "}
              | <span className="font-medium">From:</span> {fb.manager?.name || fb.manager?.email || "Unknown"}
            </p>

            <p className="mb-1">
              <span className="font-semibold text-green-700">Strengths:</span>{" "}
              {fb.strengths || "N/A"}
            </p>

            <p className="mb-1">
              <span className="font-semibold text-yellow-700">Improvements:</span>{" "}
              {fb.improvements || "N/A"}
            </p>

            <p className="mb-2">
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
            <div className="flex justify-between items-center mt-3">
              {type === "received" && !fb.acknowledged && (
                <AcknowledgeButton id={fb.id} />
              )}
              {type === "given" && user?.role === "manager" && (
                <button onClick={() => onEdit(fb)} className="text-sm text-blue-600 hover:underline">Edit</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FeedbackList;
