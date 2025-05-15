import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from "react-icons/fa";


const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/users');
        setUsers(response.data);
      } catch (error) {
        setError('Error fetching users');
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:5002/api/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      setError('Error deleting user');
    }
  };

  const handleEdit = (user) => {
    setEditUser(user.id);
    setEditUsername(user.username);
    setEditRole(user.role);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5002/api/users/${editUser}`, { username: editUsername, role: editRole });
  
      // Fetch updated users from the backend to avoid UI inconsistency
      const response = await axios.get('http://localhost:5002/api/users');
      setUsers(response.data);
  
      setEditUser(null);
      setError('');
    } catch (error) {
      setError('Error updating user');
    }
  };

  return (
    <div>
  <h2 style={{ color: 'white', fontSize: '40px' }}>User List</h2>
  {error && <p className="error-message">{error}</p>}
  <table style={{ width: '1500px', margin: '0 auto', marginBottom: '25px' }}>
    <thead>
      <tr>
        <th>Username</th>
        <th>Role</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.map(user => (
        <tr key={user.id}>
          <td>
            {user.id === editUser ? (
              <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
            ) : (
              user.username
            )}
          </td>
          <td>
            {user.id === editUser ? (
              <input value={editRole} onChange={(e) => setEditRole(e.target.value)} />
            ) : (
              user.role
            )}
          </td>
          <td>
            {user.id === editUser ? (
              <button onClick={handleUpdate}>Save</button>
            ) : (
              <button
                onClick={() => handleEdit(user)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007bff' }}
              >
                <FaEdit size={18} />
              </button>
            )}
            <button
              onClick={() => handleDelete(user.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', marginLeft: '10px' }}
            >
              <FaTrash size={18} />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  );
};

export default UserTable;