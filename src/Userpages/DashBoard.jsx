import React from 'react'
import UserNav from '../UserComponents/UserNav'
import Dashcontainer from '../UserComponents/Dashcontainer'

const DashBoard = () => {
  return (
    <div style={{ background: 'rgb(252, 198, 137)', height: '100vh' }}>
        <UserNav />
        <Dashcontainer />
        
        
    </div>
    
  )
}

export default DashBoard