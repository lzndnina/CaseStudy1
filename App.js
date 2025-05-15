import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import './stud.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Login from './components/Login';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import EditorPage from './pages/EditorPage';
import ViewerPage from './pages/ViewerPage';
import Navbar from './components/Navbar';
import AdminCreateUser from './components/AdminCreateUser';
import AnalyticsPage from './pages/AnalyticsPage';
import DashboardPage from './pages/DashboardPage';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const App = () => {
  const [userRole, setUserRole] = React.useState(localStorage.getItem('role'));
  const [username, setUsername] = React.useState(localStorage.getItem('username'));
  const location = useLocation();

  return (
      <div>
        {location.pathname !== '/login' && <Navbar username={username} userRole={userRole} setUserRole={setUserRole} />}
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login setUserRole={setUserRole} setUsername={setUsername} />} />
          <Route path="/home" element={userRole ? <HomePage userRole={userRole} /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={userRole ? <DashboardPage userRole={userRole} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={userRole === 'admin' ? <AdminPage userRole={userRole} /> : <Navigate to="/login" />} />
          <Route path="/editor" element={userRole === 'editor' ? <EditorPage userRole={userRole} /> : <Navigate to="/login" />} />
          {userRole === 'admin' && (
            <Route path="/create-user" element={<AdminCreateUser />} />
          )}
          <Route path="/viewer" element={userRole === 'viewer' ? <ViewerPage userRole={userRole} /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={userRole ? <AnalyticsPage userRole={userRole} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    );
  }

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;