const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

const fs = require('fs');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000' // Adjust this to match your frontend URL
}));
app.use(bodyParser.json());

// Connect to Redis
const client = redis.createClient({
  url: 'redis://127.0.0.1:6379' // Corrected Redis connection
});

client.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection error:', err));

// User Registration
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userId = `user:${username}`;
    const existingUser = await client.exists(userId);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    await client.hSet(userId, {
      username,
      password, // In a real application, make sure to hash the password before storing it
      role
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const keys = await client.keys('user:*');
    const users = await Promise.all(keys.map(async (key) => {
      return { id: key.split(':')[1], ...(await client.hGetAll(key)) };
    }));
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const userId = `user:${username}`;
    const user = await client.hGetAll(userId);

    console.log('User data from Redis:', user); // Log user data
    console.log('Provided password:', password); // Log provided password

    if (!user || user.password !== password) {
      console.log('Invalid username or password'); // Log invalid login attempt
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Verify Token
app.get('/api/verifyToken', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ role: decoded.role });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Protected Route Example
app.get('/api/protected-route', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ message: 'Protected data' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// CRUD Operations

// Create (C) - Save student data
app.post('/students', async (req, res) => {
  const { id, name, gender, contact, address, employmentstatus, housenum, health, birthday, householdcount } = req.body;

  if (!id || !name || !gender || !contact || !address || !employmentstatus || !housenum || !health || !birthday || !householdcount) {
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
      gender,
      contact: String(contact),
      address,
      employmentstatus,
      housenum: String(housenum),
      health,
      birthday: String(birthday),
      householdcount: String(householdcount)
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

    res.status(200).json({ message: 'Resident updated successfully' });
  } catch (error) {
    console.error('Error updating resident:', error);
    res.status(500).json({ message: 'Failed to update resident' });
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


// Initial user creation
const createInitialUsers = async () => {
  const users = [
    { username: 'admin', password: '123', role: 'admin' },
    { username: 'editor', password: '123', role: 'editor' },
    { username: 'viewer', password: '123', role: 'viewer' }
  ];

  for (const user of users) {
    const userId = `user:${user.username}`;
    const existingUser = await client.exists(userId);
    if (!existingUser) {
      await client.hSet(userId, {
        username: user.username,
        password: user.password, // In a real application, make sure to hash the password before storing it
        role: user.role
      });
    }
  }
};

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  const userId = `user:${req.params.id}`;

  try {
    const deleted = await client.del(userId);
    if (deleted === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const userId = `user:${req.params.id}`;
  const updates = req.body;

  console.log('Update request for user:', userId, updates); // Debugging

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
    const existingUser = await client.hGetAll(userId);
    console.log('Existing user data:', existingUser); // Log existing user

    if (Object.keys(existingUser).length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user in Redis
    await client.hSet(userId, updates);

    // Retrieve and log updated user
    const updatedUser = await client.hGetAll(userId);
    console.log('Updated user data:', updatedUser);

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});


app.delete('/api/users/:id', async (req, res) => {
  const userId = `user:${req.params.id}`;

  console.log('Delete request for user:', userId); // Log request details

  try {
    const deleted = await client.del(userId);
    console.log('Delete response:', deleted); // Log delete response

    if (deleted === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});








// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});


// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await createInitialUsers(); // Create initial users when the server starts
});