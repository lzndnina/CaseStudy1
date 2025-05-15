import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';
import { Pie, Bar } from 'react-chartjs-2'; // Import Bar chart
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'; // Register Bar chart elements
import "./stud.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_URL = "http://localhost:5002/students";

function App() {
  const [formData, setFormData] = useState({ id: '', name: '', course: '', age: '', address: '', email: '', gpa: '', yearlevel: '', dateenrolled: '' });
  const [students, setStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletedStudent, setDeletedStudent] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);
  const [sortKey, setSortKey] = useState("id");

  const fetchStudents = async () => {
    try {
      const response = await axios.get(API_URL);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      toast.success('Student added successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', course: '', age: '', address: '', email: '', gpa: '', yearlevel: '', dateenrolled: '' });
    } catch (error) {
      toast.error('Error adding student!');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${formData.id}`, formData);
      toast.success('Student updated successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', course: '', age: '', address: '', email: '', gpa: '', yearlevel: '', dateenrolled: '' });
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating student!');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    
    if (!confirmDelete) {
        return; // If the user doesn't confirm, do nothing
    }

    try {
        const studentToDelete = students.find((s) => s.id === id);
        setDeletedStudent(studentToDelete);

        setStudents(students.filter((s) => s.id !== id));

        const timeout = setTimeout(async () => {
          await axios.delete(`${API_URL}/${id}`, { data: { confirmation: true } });
          setDeletedStudent(null);
        }, 5002);

        setUndoTimeout(timeout);
        toast.success('Student deleted! Click Undo to restore.');
    } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Error deleting student!');
    }
  };

  const undoDelete = async () => {
    if (deletedStudent) {
      try {
        clearTimeout(undoTimeout);
        await axios.put(`${API_URL}/${deletedStudent.id}`, deletedStudent); // Use PUT instead of POST
        setStudents([...students, deletedStudent]);
        setDeletedStudent(null);
        toast.success('Undo successful! Student restored.');
      } catch (error) {
        console.error('Error restoring student:', error);
        toast.error('Error restoring student!');
      }
    }
  };

  const handleEdit = (student) => {
    setFormData(student);
    setIsEditing(true);
  };

  const handleSortChange = (e) => {
    setSortKey(e.target.value);
  };

  const sortedStudents = [...students]
    .filter(student => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const valA = isNaN(a[sortKey]) ? a[sortKey].toLowerCase() : Number(a[sortKey]);
      const valB = isNaN(b[sortKey]) ? b[sortKey].toLowerCase() : Number(b[sortKey]);
      return valA < valB ? -1 : valA > valB ? 1 : 0;
    });

    const handleCSVUpload = (event) => {
      const file = event.target.files[0];
    
      if (!file) {
        toast.error("Please select a CSV file.");
        return;
      }
    
      Papa.parse(file, {
        complete: async (result) => {
          const parsedData = result.data;
    
          if (parsedData.length === 0) {
            toast.error("CSV file is empty!");
            return;
          }
    
          // Process the CSV data (skip the header row)
          const formattedData = parsedData.slice(1).map((row) => ({
            id: row[0],
            name: row[1],
            course: row[2],
            age: row[3],
            address: row[4],
            email: row[5],
            gpa: row[6],
            yearlevel: row[7],
            dateenrolled: row[8],
          }));
    
          // Make individual requests for each student if the API doesn't support bulk upload
          try {
            for (const student of formattedData) {
              await axios.post(API_URL, student);
            }
            toast.success("Students uploaded successfully!");
            fetchStudents();
          } catch (error) {
            console.error("Error uploading students:", error);
            toast.error("Error uploading students!");
          }
        },
        header: false,
      });
    };

    // Prepare data for the pie chart
    const courseDistribution = students.reduce((acc, student) => {
      acc[student.course] = (acc[student.course] || 0) + 1;
      return acc;
    }, {});

    const pieChartData = {
      labels: Object.keys(courseDistribution),
      datasets: [
        {
          label: 'Number of Students',
          data: Object.values(courseDistribution),
          backgroundColor: [
            'rgba(163, 52, 18, 0.94)',  // Maroon shade
            'rgba(255, 89, 0, 0.85)',   // Orange shade
            'rgba(255, 140, 0, 0.6)',   // Light orange shade
            'rgba(255, 87, 34, 0.6)',   // Maroon shade (repeated for balance)
            'rgba(204, 51, 0, 0.6)',    // Darker orange
            'rgba(153, 0, 0, 0.6)',     // Dark maroon
          ],
          borderColor: [
            'rgba(153, 0, 0, 1)',       // Dark maroon
          ],
          borderWidth: 1,
        },
      ],
    };
    
    // Calculate average GPA for each course
  const calculateAverageGPA = () => {
    const courseGPA = students.reduce((acc, student) => {
      if (!acc[student.course]) {
        acc[student.course] = { total: 0, count: 0 };
      }
      acc[student.course].total += parseFloat(student.gpa);
      acc[student.course].count += 1;
      return acc;
    }, {});

    const averageGPA = Object.keys(courseGPA).map((course) => ({
      course,
      average: (courseGPA[course].total / courseGPA[course].count).toFixed(2),
    }));

    return averageGPA;
  };

  // Prepare data for the bar chart
  const averageGPAData = calculateAverageGPA();

  const barChartData = {
    labels: averageGPAData.map((data) => data.course),
    datasets: [
      {
        label: 'Average GPA',
        data: averageGPAData.map((data) => data.average),
        backgroundColor: 'rgba(129, 20, 20, 0.59)',
        borderColor: 'rgb(63, 91, 110)',
        borderWidth: 1,
      },
    ],
  };


  return (
    <div className="container" style={{ textAlign: 'center' , marginTop:'50px'}} >
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start', 
        padding: '10px', 
        borderBottom: '7px solid #ccc'  
      }}>
        <img src="/images/logo.png" alt="Logo" style={{ width: '150px', height: '150px', marginLeft: '20px' }} />
        <h1 style={{ marginLeft: '20px' }}>Student CRUD with Redis</h1>
      </header>
      <br/><br/><br/>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background:'rgba(223, 192, 145, 0.75)'}}>
  <div 
    className="left-container" 
    style={{ 
      width: '20%', 
      padding: '20px', 
      backgroundImage: 'url("/images/background.jpg")', 
    backgroundSize: 'cover', 
    backgroundPosition: 'center', 
    backgroundRepeat: 'no-repeat' , 
      borderRadius: '10px', 
      marginLeft: '55px', 
      height: '900px' ,
    }}
  >
    <h3 style={{ marginTop: '10px', color:'maroon', fontSize:'30px'}}>Student Information Form</h3>
    <form 
      onSubmit={isEditing ? handleEditSubmit : handleAddSubmit} 
      style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '70px'}}
    >
      <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required disabled={isEditing} />
      <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <input type="text" name="course" placeholder="Course" value={formData.course} onChange={handleChange} required />
      <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
      <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
      <input type="text" name="email" placeholder="Institutional Email" value={formData.email} onChange={handleChange} required />
      <input type="text" name="gpa" placeholder="GPA" value={formData.gpa} onChange={handleChange} required />
      <input type="text" name="yearlevel" placeholder="Year Level" value={formData.yearlevel} onChange={handleChange} required />
      <div className="form-group">
        <label htmlFor="dateenrolled" className="date-label" style={{ marginLeft: '0px', color: 'black', fontSize:'15px'}}>Date Enrolled</label>
        <input type="date" name="dateenrolled" id="dateenrolled" value={formData.dateenrolled} onChange={handleChange} required />
      </div>
      <button type="submit">{isEditing ? 'Update Student' : 'Add Student'}</button>
    </form>
    <h1>_________________</h1>
    <div className="upload-section">
  <h3 style={{ fontSize: '25px' }}>Upload CSV File</h3>
  <input 
    type="file" 
    accept=".csv" 
    onChange={handleCSVUpload} 
    id="fileInput" 
    className="hidden-input"
  />
  <label htmlFor="fileInput" className="custom-file-label">Choose File</label>
</div>

  </div>
  <div 
    className="right-container" 
    style={{ 
      marginLeft: '20px', 
      width: '80%', 
      padding: '20px', 
      background: '#ffffffd6', 
      borderRadius: '10px' 
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "20px" }}>
      <input type="text" placeholder="Search by Name..." value={searchQuery} onChange={handleSearchChange} style={{ padding: "8px", width: "250px", marginRight: "10px" }} />
      <button onClick={() => setSearchQuery("")} style={{ padding: "8px", marginRight: "40px" }}>
        Clear
      </button>
      <select onChange={handleSortChange} value={sortKey} style={{ padding: "8px", marginRight: "10px" }}>
        <option value="id">Sort by ID</option>
        <option value="name">Sort by Name</option>
        <option value="age">Sort by Age</option>
        <option value="course">Sort by Course</option>
        <option value="address">Sort by Address</option>
        <option value="email">Sort by Email</option>
        <option value="gpa">Sort by GPA</option>
        <option value="yearlevel">Sort by Year Level</option>
      </select>
      {deletedStudent && <button onClick={undoDelete}>Undo Delete</button>}
    </div>
    <br/>
    <h1>Student List</h1>
    <table border="1" style={{ width: '100%' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Course</th>
          <th>Age</th>
          <th>Address</th>
          <th>Institutional Email</th>
          <th>GPA</th>
          <th>Year Level</th>
          <th>Date Enrolled</th>
          <th>Actions</th>
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
            <td>
              <button 
                onClick={() => handleEdit(student)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: '#007bff', 
                  fontSize: '1.2em' 
                }}
              >
                <i className="fas fa-edit"></i> 
              </button>
              <button
                onClick={() => handleDelete(student.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#dc3545',
                  fontSize: '1.2em',
                  marginLeft: '10px'
                }}
              >
                <i className="fas fa-trash"></i> 
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <br/>
  </div>
</div> {/* Closing main container div */}

      <br/>
      <table style={{border: '2px solid white'}}>
  <th style={{backgroundColor:'#f5e6d0c4'}}>
    <h2 style={{fontSize:'50px'}}>Course Distribution</h2>
    <div style={{ width: '70%', height: '400px', margin: '0 auto' }}>
      <Pie data={pieChartData} />
    </div>
  </th>
  <th style={{backgroundColor:'#f5e6d0c4'}}>
    
    <h2 style={{fontSize:'50px'}}>Average GPA by Course</h2>
    <div style={{ width: '70%', height: '400px', margin: '0 auto' }}>
  <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
</div>
  </th>
</table>
<br/>

      <ToastContainer />

      <footer style={{ 
  marginTop: '50px', 
  padding: '20px', 
  backgroundColor: '#f1f1f1', 
  borderTop: '7px solid #ccc', 
  textAlign: 'center' 
}}>
  <img src="/images/footer.png" alt="Logo" style={{ width: '150px', height: '150px' }} />
  <p style={{ marginTop: '10px', fontSize: '20px', color: '#333' }}>
    © {new Date().getFullYear()} Student CRUD with Redis. All rights reserved.
  </p>
</footer>

    </div> 
);
}
export default App;


