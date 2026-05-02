import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Register() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg]           = useState("");
  const [isError, setIsError]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/register", { email, password });
      setIsError(false);
      setMsg("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setIsError(true);
      setMsg("This email is already registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">HR Attrition Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {msg && (
            <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg mb-5 border ${
              isError
                ? "bg-red-50 border-red-100 text-red-600"
                : "bg-emerald-50 border-emerald-100 text-emerald-600"
            }`}>
              {msg}
            </div>
          )}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="you@company.com" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition disabled:opacity-60 mt-1 shadow-sm">
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-5 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}