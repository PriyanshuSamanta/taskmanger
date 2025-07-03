import React from 'react'
import Navbar from '../components/Navbar'; // adjust path if needed
import Sidebar from '../components/Sidebar';
import AllTaskTable from '../components/AllTaskTable';
const AllTaskpage = () => {
  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='flex'>
        <Sidebar />
        <div className='w-full'>
          <Navbar />
          <AllTaskTable />
        </div>
      </div>
    </div>
  )
}

export default AllTaskpage