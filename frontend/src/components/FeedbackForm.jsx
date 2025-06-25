import React, { useState, useEffect } from "react";
import API from "../api/axios";

function FeedbackForm({ employee, onSubmit, initialData }) {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: "",
    strengths: "",
    improvements: "",
    sentiment: "positive",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    API.get("/users/team", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => setEmployees(res.data))
      .catch(err => console.error("Team fetch error:", err));
    }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        employee_id: initialData.employee_id,
        strengths: initialData.strengths,
        improvements: initialData.improvements,
        sentiment: initialData.sentiment,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      employee_id: "",
      strengths: "",
      improvements: "",
      sentiment: "positive",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-3"
    >
      <h2 className="text-xl text-center font-semibold text-gray-700">Submit Feedback</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Employee:
        </label>
        <select
          name="employee_id"
          value={formData.employee_id}
          onChange={handleChange}
          required
          className="w-full border-gray-300 rounded-lg shadow p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Choose an employee --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id.toString()}>
              {emp.name} ({emp.email})
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Strengths:
        </label>
        <textarea
          name="strengths"
          value={formData.strengths}
          onChange={handleChange}
          required
          className="w-full border-gray-300 rounded-lg shadow p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Areas of Improvement:
        </label>
        <textarea
          name="improvements"
          value={formData.improvements}
          onChange={handleChange}
          required
          className="w-full border-gray-300 rounded-lg shadow p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          rows={3}
        />
      </div>
    
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sentiment:
        </label>
        <select
          name="sentiment"
          value={formData.sentiment}
          onChange={handleChange}
          required
          className="w-full border-gray-300 rounded-lg shadow p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Choose sentiment --</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
      </div>

      <div className="text-center">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {initialData ? "Update Feedback" : "Submit Feedback"}
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;
