import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authProvider";

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold tracking-wide">Feedback System</div>
        <div className="flex space-x-4 items-center">
          {user ? (
            <>
              <Link to={`/${user.role}`} className="hover:text-gray-200 transition duration-200">Dashboard</Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded shadow-sm transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="text-white">Login</Link>
              <Link to="/register" className="text-white">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
