import React, { useState } from 'react';
import axios from 'axios';
import UserTable from '../components/UserTable';

const AdminCreateUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5002/api/register', { username, password, role });
      setSuccess('User created successfully');
      setError('');
    } catch (error) {
      setError('Error creating account');
      setSuccess('');
    }
  };

  return (
    <div>
    <div
  className="create-user-container"
  style={{
    backgroundImage: 'url("/images/manageruser1.jpeg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Center align the items
    justifyContent: "center", // Center vertically
    minHeight: "80vh",
  }}
>
  <h2 style={{ color: "white", marginBottom: "30px" }}>Create User Account</h2>

  <form
    onSubmit={handleCreateUser}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "15px", // Space between form elements
      background: "rgba(0, 0, 0, 0.5)", // Optional: semi-transparent background for better readability
      padding: "20px",
      borderRadius: "10px",
    }}
  >
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      placeholder="Username"
      required
      style={{ width: "250px", padding: "10px", borderRadius: "5px" }}
    />

    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Password"
      required
      style={{ width: "250px", padding: "10px", borderRadius: "5px" }}
    />

    <select
      value={role}
      onChange={(e) => setRole(e.target.value)}
      style={{ width: "270px", padding: "10px", borderRadius: "5px" }}
    >
      <option value="viewer">Viewer</option>
      <option value="editor">Editor</option>
      <option value="admin">Admin</option>
    </select>

    {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}
    {success && <p className="success-message" style={{ color: "green" }}>{success}</p>}

    <button
      type="submit"
      style={{
        width: "150px",
        padding: "10px",
        margin: "12px",
        borderRadius: "5px",
        backgroundColor: "maroon",
        color: "white",
        border: "none",
        cursor: "pointer",
      }}
    >
      Create Account
    </button>
  </form>

      <br/><br/><br/><br/><br/>
      <UserTable />
     
      
 
    </div>
<div>
<footer style={{ marginTop: '0px', padding: '20px', backgroundColor: '#a8e6f0', borderTop: '7px solid #ccc', textAlign: 'center', maxHeight: '50vh' }}>
<img src="/images/footer.png" alt="Logo" style={{ width: '100px', height: '100px' }} />
<p style={{ marginTop: '10px', fontSize: '20px', color: '#333' }}>
  © {new Date().getFullYear()} Resident Profiling Management System. All rights reserved.
</p>
</footer>
</div></div>
    

    
  );
};

export default AdminCreateUser;