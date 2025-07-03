
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UserPage from './pages/Userpage';
import Taskpages from './pages/Taskpages';
import AllTaskpage from './pages/AllTaskpage';
import LoginPage from './components/LoginPage';
import UserLoginPage from './Userpages/UserLogin';
import DashBoard from './Userpages/DashBoard';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<UserPage />} />
        <Route path="/taskboard/:projectId" element={<Taskpages />} />
        <Route path="/alltask" element={<AllTaskpage />} />
        <Route path="/login" element={<LoginPage />} />



        {/* User Page */}
        <Route path="/userlogin" element={<UserLoginPage />} />
        <Route path="/dashboard" element={<DashBoard />} />


      </Routes>
    </Router>
  );
}

export default App;