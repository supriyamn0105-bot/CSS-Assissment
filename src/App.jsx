import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaDownload, FaSpinner } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import './App.css';

const initialStudents = [
    { id: 1, name: 'Supriya', email: 'supriya@gmail.com', age: 22 },
    { id: 2, name: 'Akshata', email: 'akshata@gmail.com', age: 20 },
    { id: 3, name: 'Madhu', email: 'madhu@gmail.com', age: 25 }
];

function App() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', age: '' });
    const [errors, setErrors] = useState({});
    const [filter, setFilter] = useState('');

    useEffect(() => {
        simulateLoading();
    }, []);

    const simulateLoading = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStudents(initialStudents);
        setLoading(false);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.age || formData.age < 16 || formData.age > 100) {
            newErrors.age = 'Age must be between 16-100';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (editingStudent) {
            setStudents(students.map(student =>
                student.id === editingStudent.id
                    ? { ...formData, id: editingStudent.id, age: parseInt(formData.age) }
                    : student
            ));
            setEditingStudent(null);
        } else {
            const newStudent = {
                id: Date.now(),
                ...formData,
                age: parseInt(formData.age)
            };
            setStudents([...students, newStudent]);
        }

        setFormData({ name: '', email: '', age: '' });
        setErrors({});
        setShowForm(false);
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            name: student.name,
            email: student.email,
            age: student.age.toString()
        });
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            setStudents(students.filter(student => student.id !== id));
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(filter.toLowerCase()) ||
        student.email.toLowerCase().includes(filter.toLowerCase())
    );

    const downloadExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredStudents);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Students');
        XLSX.writeFile(wb, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <FaSpinner className="spinner" />
                <p>Loading students...</p>
            </div>
        );
    }

    return (
        <div className="app">
            <header>
                <h1>Students Management</h1>
                <div className="controls">
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="search"
                    />
                    <button onClick={() => { setShowForm(true); setEditingStudent(null); }} className="btn-primary">
                        <FaPlus /> Add Student
                    </button>
                    <button onClick={downloadExcel} className="btn-secondary" disabled={filteredStudents.length === 0}>
                        <FaDownload /> Download Excel
                    </button>
                </div>
            </header>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Age</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="no-data">No students found</td>
                            </tr>
                        ) : (
                            filteredStudents.map(student => (
                                <tr key={student.id}>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>{student.age}</td>
                                    <td className="actions">
                                        <button onClick={() => handleEdit(student)} className="btn-edit">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(student.id)} className="btn-delete">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={errors.name ? 'error' : ''}
                                />
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>
                            <div className="form-group">
                                <label>Age *</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    className={errors.age ? 'error' : ''}
                                    min="16"
                                    max="100"
                                />
                                {errors.age && <span className="error-text">{errors.age}</span>}
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">
                                    {editingStudent ? 'Update' : 'Add'} Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingStudent(null);
                                        setFormData({ name: '', email: '', age: '' });
                                        setErrors({});
                                    }}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
