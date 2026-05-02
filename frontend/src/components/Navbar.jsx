import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-0 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 py-4">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">HR Attrition</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate("/dashboard")}
            className={`px-4 py-5 text-sm font-medium border-b-2 transition-colors ${
              isActive("/dashboard")
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}>
            Dashboard
          </button>
          <button onClick={() => navigate("/upload")}
            className={`px-4 py-5 text-sm font-medium border-b-2 transition-colors ${
              isActive("/upload")
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}>
            Upload CSV
          </button>
        </div>
      </div>
      <button onClick={logout}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Logout
      </button>
    </nav>
  );
}