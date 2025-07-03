import React, { useState } from "react";
import axios from "axios";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import "../css/login.css";

const UserLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const res = await axios.post('http://localhost:5001/api/userlogin', {
        email,
        password
      }, { withCredentials: true });

      if (res.data.success) {
        window.location.href = '/dashboard'; // redirect to user dashboard
      }
    } catch (err) {
      alert("Invalid login");
    }
  };

  return (
    <div className="login-main">
      <div className="login-left">
        <img src={Image} alt="Login Visual" />
      </div>
      <div className="login-right">
        <div className="login-right-container">
          <div className="login-logo">
            <img src={Logo} alt="Logo" />
          </div>
          <div className="login-center">
            <h2>Welcome User!</h2>
            <p>Please enter your details</p>
            <form className="login-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <div className="pass-input-div">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                {showPassword ? (
                  <FaEyeSlash onClick={() => setShowPassword(false)} />
                ) : (
                  <FaEye onClick={() => setShowPassword(true)} />
                )}
              </div>

              <div className="login-center-buttons">
                <button type="button" onClick={login}>Log In</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoginPage;
