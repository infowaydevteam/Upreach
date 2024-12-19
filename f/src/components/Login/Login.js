import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import config from '../config'; // Import the config file

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
  
    try {
      const apiUrl = config.apiBaseUrl;
  
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (response.status === 200) {
        console.log('Login successful');
        localStorage.setItem('userEmail', username); // Store email
        localStorage.setItem('username', data.username); // Store username
        navigate('/sideTabpanel');
      } else {
        setErrorMessage(data.message || 'Invalid login credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="login-page">
      <div className="rain">
        {[...Array(50)].map((_, index) => (
          <div className="rain-drop" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 1}s` }} key={index}></div>
        ))}
      </div>
      <div className="brand-name">UpReach</div>
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;
