import Navbar from '../components/Navbar'; // adjust path if needed
import UserTable from '../components/UserTable';
import Sidebar from '../components/Sidebar';
import React from 'react';

const UserPage = () => {

  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='flex'>
        <Sidebar />
        <div className='w-full'>
          <Navbar />
          <UserTable />
        </div>
      </div>
        
    </div>
   
  );
};

export default UserPage;
