import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    manager_id: "",
  });
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await API.get("/users/managers");
        setManagers(res.data);
      } catch (err) {
        console.error("Failed to fetch managers:", err);
      }
    };
    fetchManagers();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send manager_id only if role is employee
      const payload =
        formData.role === "employee"
          ? formData
          : { ...formData, manager_id: undefined };

      await API.post("/users/register", payload);
      alert("Registered successfully. You can now log in.");
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      alert("Failed to register.");
    }
  };

  return (
    <div className="flex justify-center items-center w-screen h-screen bg-gray-100">
    <form className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold text-center text-gray-700">Register</h2>
      <input className="w-full px-4 py-2 border border-gray-300 rounded-lg" name="name" placeholder="Name" onChange={handleChange} required />
      <input className="w-full px-4 py-2 border border-gray-300 rounded-lg" name="email" placeholder="Email" onChange={handleChange} required />
      <input className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        required
      />
      <select name="role" value={formData.role} onChange={handleChange} className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-white text-grey-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="manager">Manager</option>
        <option value="employee">Employee</option>
      </select>
      {formData.role === "employee" && (
        <select
          name="manager_id"
          value={formData.manager_id}
          onChange={handleChange}
          required
          className="w-full mt-4 px-2 py-2 border border-gray-300 rounded-lg bg-white text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Manager</option>
          {managers.map((mgr) => (
            <option key={mgr.id} value={mgr.id}>
              {mgr.name || mgr.email}
            </option>
          ))}
        </select>
      )}
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Register</button>
    </form>
    </div>
  );
}
