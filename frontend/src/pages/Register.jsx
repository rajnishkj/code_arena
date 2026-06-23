import React, { useState } from 'react';
import API from '../services/api';

const Register = () => {
    const [form, setForm] = useState({
        name: '',
        username: '',
        elo: 1200,
        total_game_time: 0,
        encrypted_password: ''
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const res = await API.post('/users/register', form);
            alert('Registered! User ID: ' + res.data.id);
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <input name="name" placeholder="Name" onChange={handleChange} />
            <input name="username" placeholder="Username" onChange={handleChange} />
            <input name="encrypted_password" placeholder="Password" type="password" onChange={handleChange} />
            <button onClick={handleSubmit}>Register</button>
        </div>
    );
};

export default Register;