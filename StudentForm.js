import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const StudentForm = ({ fetchStudents, isEditing, formData, setFormData, setIsEditing, userRole }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/students/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        toast.success('Student updated successfully!');
      } else {
        await axios.post('/api/students', formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        toast.success('Student added successfully!');
      }
      fetchStudents();
      setFormData({ id: '', name: '', gender: '', contact: '', address: '', employmentstatus: '', housenum: '', health: '', birthday: '', householdcount: '' });
      setIsEditing(false);
    } catch (error) {
      toast.error('Error saving student!');
    }
  };

  if (userRole !== 'admin' && userRole !== 'editor') {
    return null; // Do not render the form if the user is not an admin or editor
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required disabled={isEditing} />
      <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} required />
      <input type="number" name="contact" placeholder="Contact No." value={formData.contact} onChange={handleChange} required />
      <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
      <input type="text" name="employmentstatus" placeholder="Employment Status" value={formData.employmentstatus} onChange={handleChange} required />
      <input type="number" name="housenum" placeholder="House No." value={formData.housenum} onChange={handleChange} required />
      <input type="text" name="health" placeholder="Health Status" value={formData.health} onChange={handleChange} required />
      <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} required />
      <input type="number" name="householdcount" placeholder="Household Count" value={formData.householdcount} onChange={handleChange} required />
      <button type="submit">{isEditing ? 'Update Student' : 'Add Student'}</button>
    </form>
  );
};

export default StudentForm;