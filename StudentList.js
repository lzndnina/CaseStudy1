import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const StudentList = ({ userRole }) => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('id');

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStudents(response.data);
    } catch (error) {
      toast.error('Error fetching students!');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/students/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Student deleted successfully!');
      fetchStudents();
    } catch (error) {
      toast.error('Error deleting student!');
    }
  };

  const sortedStudents = students
    .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const valA = isNaN(a[sortKey]) ? a[sortKey].toLowerCase() : Number(a[sortKey]);
      const valB = isNaN(b[sortKey]) ? b[sortKey].toLowerCase() : Number(b[sortKey]);
      return valA < valB ? -1 : valA > valB ? 1 : 0;
    });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px', width: '250px' }}
        />
        <select onChange={(e) => setSortKey(e.target.value)} value={sortKey} style={{ padding: '8px' }}>
          <option value="id">Sort by ID</option>
          <option value="name">Sort by Name</option>
          <option value="age">Sort by Age</option>
          <option value="course">Sort by Course</option>
          <option value="gpa">Sort by GPA</option>
        </select>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Course</th>
            <th>Age</th>
            <th>Address</th>
            <th>Email</th>
            <th>GPA</th>
            <th>Year Level</th>
            <th>Date Enrolled</th>
            {(userRole === 'admin' || userRole === 'editor') && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.course}</td>
              <td>{student.age}</td>
              <td>{student.address}</td>
              <td>{student.email}</td>
              <td>{student.gpa}</td>
              <td>{student.yearlevel}</td>
              <td>{student.dateenrolled}</td>
              {(userRole === 'admin' || userRole === 'editor') && (
                <td>
                  <button onClick={() => handleDelete(student.id)} style={{ color: 'red' }}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;