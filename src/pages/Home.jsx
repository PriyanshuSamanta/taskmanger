import React from 'react';
import Navbar from '../components/Navbar'; // adjust path if needed
import ProjectTable from '../components/ProjectTable'; // adjust path if needed
import Sidebar from '../components/Sidebar';

const Home = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className='flex'>
        <Sidebar />
        <div className='w-full'>
          <Navbar />
          <ProjectTable />
        </div>
      </div>
      
      
    </div>
  );
};

export default Home;