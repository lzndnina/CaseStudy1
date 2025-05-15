const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to Redis
const client = redis.createClient({
  url: 'redis://127.0.0.1:6379' // Corrected Redis connection
});

client.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection error:', err));

// CRUD Operations

// Create (C) - Save student data
app.post('/students', async (req, res) => {
  const { id, name, course, age, address, email, gpa, yearlevel, dateenrolled } = req.body;

  if (!id || !name || !course || !age || !address || !email || !gpa || !yearlevel || !dateenrolled) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if student already exists
    const existingStudent = await client.exists(`student:${id}`);
    if (existingStudent) {
      return res.status(409).json({ message: 'Student already exists' });
    }

    const studentData = {
      name,
      course,
      age: String(age),
      address,
      email,
      gpa: String(gpa),
      yearlevel: String(yearlevel),
      dateenrolled: String(dateenrolled)
    };

    await client.hSet(`student:${id}`, studentData);
    res.status(201).json({ message: 'Student saved successfully' });
  } catch (error) {
    console.error('Error saving student:', error);
    res.status(500).json({ message: 'Failed to save student' });
  }
});

// Read (R) - Get all students
app.get('/students', async (req, res) => {
  try {
    const keys = await client.keys('student:*');
    const students = await Promise.all(keys.map(async (key) => {
      return { id: key.split(':')[1], ...(await client.hGetAll(key)) };
    }));
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to retrieve students' });
  }
});

// Update (U) - Update student data
app.put('/students/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
    const existingStudent = await client.hGetAll(`student:${id}`);
    if (Object.keys(existingStudent).length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (updates.dateenrolled) {
      updates.dateenrolled = String(updates.dateenrolled);
    }

    const updatedData = { ...existingStudent, ...updates };
    await client.hSet(`student:${id}`, updatedData);

    res.status(200).json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
});

// Delete (D) - Remove student by ID with confirmation
app.delete('/students/:id', async (req, res) => {
  const id = req.params.id;
  const { confirmation } = req.body; // Get confirmation from the request body

  if (!confirmation) {
    return res.status(400).json({ message: 'Confirmation is required to delete a student' });
  }

  if (confirmation !== true) {
    return res.status(400).json({ message: 'You must confirm the deletion by setting confirmation to true' });
  }

  try {
    const deleted = await client.del(`student:${id}`);
    if (deleted === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
