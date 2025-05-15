import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; 

const Login = ({ setUserRole, setUsername }) => {
  const [username, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5002/api/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('username', username);
      setUserRole(response.data.role);
      setUsername(username);
      navigate('/home');
    } catch (error) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container" 
    style={{
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100vh',
      
      
    }}>
      <div style={{ display: 'flex', flex: '1'}}>
        <div className="login-form-container" style={{ flex: '1', minWidth:'10%' }}>
          <form onSubmit={handleLogin} className="login-form" style= {{boxShadow: '0 4px 8px rgba(59, 41, 41, 0.45)'}}>
            <h1 style={{marginRight:'-90%', marginTop:'30px', color: 'white'}}> Baranggay Villaverde Sign in</h1><br/><br/><br/>
            <input style={{marginLeft:'110%', fontSize:'15px'}} type="text" value={username} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Username" required />
            <br/>
            <input style={{marginLeft:'110%', fontSize:'15px'}} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            {error && <p className="error-message">{error}</p>}
            <button 
  type="submit" 
  style={{ fontSize: '15px', backgroundColor: 'white', color: 'black', width:'200px'}} 
  onMouseOver={(e) => e.target.style.backgroundColor = '#7798bc'} 
  onMouseOut={(e) => e.target.style.backgroundColor = ' #98c8d3'}> Log in</button>

          </form>
        </div>
        
      </div>
    </div>
  );
}; 

export default Login;