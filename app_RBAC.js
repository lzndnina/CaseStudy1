import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import EditorPage from './pages/EditorPage';
import ViewerPage from './pages/ViewerPage';
import Navbar from './components/Navbar';
import Papa from 'papaparse';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import './stud.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_URL = 'http://localhost:2/students';

function App() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/verifyToken', { headers: { Authorization: `Bearer ${token}` } })
        .then(response => setUserRole(response.data.role))
        .catch(() => setUserRole(null));
    }
  }, []);

  return (
    <Router>
      <Navbar userRole={userRole} setUserRole={setUserRole} />
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login setUserRole={setUserRole} />} />
        <Route path="/home" element={userRole ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/admin" element={userRole === 'admin' ? <AdminPage userRole={userRole} /> : <Navigate to="/login" />} />
        <Route path="/editor" element={userRole === 'editor' ? <EditorPage userRole={userRole} /> : <Navigate to="/login" />} />
        <Route path="/viewer" element={userRole === 'viewer' ? <ViewerPage userRole={userRole} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;