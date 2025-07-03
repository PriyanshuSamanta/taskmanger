import React from 'react';
import Navbar from '../components/Navbar'; // adjust path if needed
import Taskboard from '../components/Taskboard'; // adjust path if needed
import '../css/main.css'

const Taskpages = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <Taskboard />
    </div>
  );
};

export default Taskpages;