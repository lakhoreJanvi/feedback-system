import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../auth/authProvider";
import FeedbackForm from "@/components/FeedbackForm";
import FeedbackList from "../components/FeedbackList";
import { useMemo } from "react";
import API from "../api/axios";

const ManagerDashboard = () => {
  const { user, token } = useAuth();
  const [team, setTeam] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [teamSummary, setTeamSummary] = useState([]);
  const [sentimentSummary, setSentimentSummary] = useState([]);
  const [requests, setRequests] = useState([]);
  const BACKEND_URL = "http://localhost:8000";
  const COLORS = {
    positive: "#4caf50",
    neutral: "#ff9800",
    negative: "#f44336",
  };

  function getSentimentData(feedbackList) {
    const count = { positive: 0, neutral: 0, negative: 0 };
    feedbackList.forEach((f) => count[f.sentiment]++);
    return Object.entries(count).map(([k, v]) => ({ name: k, value: v }));
  }

  const sentimentData = useMemo(() => getSentimentData(feedbacks), [feedbacks]);

  const getTeamFeedbackSummary = (feedbacks, team) => {  
    const summary = {};
    feedbacks.forEach((fb) => {
      const empId = fb.employee_id;
      const emp = team.find((e) => String(e.id) === String(empId));
      if (!emp) return; 
      if (!summary[empId]) {
        summary[empId] = {
          name: emp.name || emp.email || "Unknown",
          total: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
        };
      }
      summary[empId].total += 1;
      summary[empId][fb.sentiment]++;
    });
    return Object.values(summary);
  };

  const fetchRequests = async () => {
    const res = await axios.get("/feedback/feedback-requests/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRequests(res.data);
  };

  useEffect(() => {
    if (user.role === "manager") fetchRequests();
  }, [user]);

  // Fetch feedbacks submitted by manager
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("/feedback/given", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Failed to fetch feedbacks:", err);
    }
  };

  function generateTeamSentimentSummary(feedbacks, team) {
    if (!team || team.length === 0) {
      console.warn("Team is empty. Cannot compute summary.");
      return [];
    }

    const summary = team.map(member => {
      const memberFeedbacks = feedbacks.filter(
        fb => fb.employee_id === member.id
      );
      const averageSentiment =
        memberFeedbacks.reduce((acc, curr) => acc + curr.sentiment_score, 0) /
        (memberFeedbacks.length || 1);

      return {
        name: member.name,
        feedbackCount: memberFeedbacks.length,
        averageSentiment: averageSentiment.toFixed(2),
      };
    });
    return summary;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamResponse = await axios.get(`${BACKEND_URL}/users/team`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const teamData = teamResponse.data;
        setTeam(teamData);

        const feedbackResponse = await axios.get(`${BACKEND_URL}/feedback/team`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const feedbackData = feedbackResponse.data;
        setFeedbacks(feedbackData);

        const feedbackEmployeeIds = feedbackData.map(fb => fb.employee_id);

        const summary = generateTeamSentimentSummary(feedbackData, teamData);
        setTeamSummary(summary);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (feedbacks.length > 0 && team.length > 0) {
      const summary = getTeamFeedbackSummary(feedbacks, team);
      const sentiment = getSentimentData(feedbacks);
      setTeamSummary(summary);
      setSentimentSummary(sentiment);
    }
  }, [feedbacks, team]);

  const handleFeedbackSubmit = async (formData) => {
    try {
      if (editingFeedback) {
        await API.put(`/feedback/${editingFeedback.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEditingFeedback(null);
      } else {
        await API.post("/feedback/", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      fetchFeedbacks();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error submitting feedback.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">Manager Dashboard</h2>
      <div className="mb-3 bg-white p-4 rounded shadow">
        <FeedbackForm employees={team} onSubmit={handleFeedbackSubmit} initialData={editingFeedback}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-medium mb-2 text-gray-700">Team Sentiment Summary</h3>
          <div className="flex justify-center">
          <PieChart width={300} height={300}>
            <Pie
              data={sentimentData}
              cx={150}
              cy={150}
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {sentimentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-medium mb-4 text-gray-700">Feedback Given</h3>
          <div className="max-h-96 overflow-y-auto pr-2">
            <FeedbackList type="given" onEdit={setEditingFeedback} />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mt-6">
        <h3 className="text-xl font-medium mb-2 text-gray-700 text-center">Team Feedback Overview</h3>
        {teamSummary.length === 0 ? (
          <p className="text-gray-500">No feedback data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Employee</th>
                  <th className="px-4 py-2 text-center">Total</th>
                  <th className="px-4 py-2 text-center">👍 Positive</th>
                  <th className="px-4 py-2 text-center">😐 Neutral</th>
                  <th className="px-4 py-2 text-center">👎 Negative</th>
                </tr>
              </thead>
              <tbody>
                {teamSummary.map((row, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-2">{row.name}</td>
                    <td className="px-4 py-2 text-center">{row.total}</td>
                    <td className="px-4 py-2 text-center text-green-600">{row.positive}</td>
                    <td className="px-4 py-2 text-center text-yellow-600">{row.neutral}</td>
                    <td className="px-4 py-2 text-center text-red-600">{row.negative}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
