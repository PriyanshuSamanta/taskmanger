import React from "react";
import logo from '../assets/logo.png';
export default function Navbar() {
   
  return (
    
    <nav className="bg-white shadow-sm px-6  flex items-center justify-between ">
      <div className="">
  <img src={logo} alt="Logo" className="w-18 h-14 object-contain" />
</div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        {/* Invite Button */}
        

        {/* Profile */}
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 text-blue-700 font-medium text-sm px-3  rounded-full">
            Admin
          </div>
          <span className="text-gray-500">🔔</span>
          <span className="text-gray-500">❓</span>
          <span className="text-gray-500">👤</span>
        </div>
      </div>
    </nav>
  );
}
