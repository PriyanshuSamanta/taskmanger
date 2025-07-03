import React, { useState, useEffect } from "react";
import axios from "axios";

export default function UserNav() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/dashboard", { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => (window.location.href = "/userlogin")); // redirect if not logged in
  }, []);

  return (
    <nav className="bg-white shadow-2xl px-6 py-3 flex items-center justify-between">
      {/* Logo + Menu */}
      <div className="flex items-center space-x-15">
        {/* Logo placeholder */}
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 text-blue-700 font-medium text-sm px-3 py-1 rounded-full">
            {user?.username || "Loading..."}
          </div>
          <span className="text-gray-500">🔔</span>
          <span className="text-gray-500">❓</span>
          <span className="text-gray-500">👤</span>
        </div>
      </div>
    </nav>
  );
}
