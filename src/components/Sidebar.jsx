import { useState, useEffect } from 'react';
import { FaTasks, FaUserFriends, FaFolderOpen, FaBars, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/dashboard', { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => window.location.href = '/login');
  }, []);

  return (
    <div className={`h-screen ${collapsed ? 'w-16' : 'w-52'} bg-gray-800 text-white shadow-md transition-all duration-300`}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && <div className="text-base font-bold">AGPH-TMS</div>}
        <button
          className="text-white text-xl focus:outline-none"
          onClick={() => setCollapsed(!collapsed)}
        >
          <FaBars />
        </button>
      </div>

      {/* Optional Welcome */}
      {!collapsed && user && (
        <div className="text-sm px-4 py-2 border-b border-gray-700">
          Welcome, {user.username}
        </div>
      )}

      {/* Nav Items */}
      <ul className="mt-6 space-y-2 px-2">
        <li
          className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer"
          onClick={() => navigate('/')}
        >
          <FaFolderOpen />
          {!collapsed && <span className="text-sm font-medium">Projects</span>}
        </li>

        <li
          className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer"
          onClick={() => navigate('/alltask')}
        >
          <FaTasks />
          {!collapsed && <span className="text-sm font-medium">Tasks</span>}
        </li>

        <li
          className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer"
          onClick={() => navigate('/users')}
        >
          <FaUserFriends />
          {!collapsed && <span className="text-sm font-medium">Users</span>}
        </li>

        {/* Logout */}
        <li
          className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer text-red-400 hover:text-white"
          onClick={() => {
            axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true })
              .then(() => window.location.href = '/login');
          }}
        >
          <FaSignOutAlt />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
