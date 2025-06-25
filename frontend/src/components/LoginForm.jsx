import { useState } from "react";
import axios from '../api/axios';
import { useAuth } from "../auth/authProvider";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({email: "", password: ""});

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const formData = new URLSearchParams();
            formData.append("username", form.email);
            formData.append("password", form.password);

            const res = await axios.post("http://localhost:8000/users/login", formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            const token = res.data.access_token;
            localStorage.setItem("token", token);

            const userRes = await axios.get("http://localhost:8000/users/me", {
                headers: { Authorization: `Bearer ${token}`},
            });

            const user = userRes.data;
            login(user, token);
            navigate(`/${user.role}`);
        } catch (err) {
            console.error("Login error:", err.response?.data || err.message);
            alert("Login failed: " + (err.response?.data?.detail || "Unknown error"));
        }
    };

    return (
    <div className="flex items-center justify-center w-screen h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-1 mb-4 w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="mt-1 mb-6 w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;