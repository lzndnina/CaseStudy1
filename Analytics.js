import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Analytics = ({ students }) => {
  // Course Distribution Data
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
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Average GPA Data
  const calculateAverageGPA = () => {
    const courseGPA = students.reduce((acc, student) => {
      if (!acc[student.course]) {
        acc[student.course] = { total: 0, count: 0 };
      }
      acc[student.course].total += parseFloat(student.gpa);
      acc[student.course].count += 1;
      return acc;
    }, {});

    return Object.keys(courseGPA).map((course) => ({
      course,
      average: (courseGPA[course].total / courseGPA[course].count).toFixed(2),
    }));
  };

  const barChartData = {
    labels: calculateAverageGPA().map((data) => data.course),
    datasets: [
      {
        label: 'Average GPA',
        data: calculateAverageGPA().map((data) => data.average),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2>Course Distribution</h2>
      <div style={{ width: '50%', margin: '0 auto' }}>
        <Pie data={pieChartData} />
      </div>
      <h2>Average GPA by Course</h2>
      <div style={{ width: '50%', margin: '0 auto' }}>
        <Bar data={barChartData} />
      </div>
    </div>
  );
};

export default Analytics;