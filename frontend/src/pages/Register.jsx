import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { gsap } from 'gsap';

const Register = () => {
    const [form, setForm] = useState({
        name: '',
        username: '',
        elo: 1200,
        total_game_time: 0,
        encrypted_password: ''
    });
    const containerRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        try {
            const res = await API.post('/users/register', form);
            alert('Registered! User ID: ' + res.data.id);
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        }}>
            <div ref={containerRef} style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '48px',
                width: '380px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <h2 style={{ color: '#00ff88', margin: 0, fontSize: '28px', textAlign: 'center' }}>
                    ⚔️ Code Arena
                </h2>
                <p style={{ color: '#888', textAlign: 'center', margin: 0 }}>Create your account</p>

                {['name', 'username'].map(field => (
                    <input
                        key={field}
                        name={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                ))}
                <input
                    name="encrypted_password"
                    placeholder="Password"
                    type="password"
                    onChange={handleChange}
                    style={inputStyle}
                />
                <button onClick={handleSubmit} style={btnStyle}
                        onMouseEnter={e => gsap.to(e.target, { scale: 1.05, duration: 0.2 })}
                        onMouseLeave={e => gsap.to(e.target, { scale: 1, duration: 0.2 })}
                >
                    Register
                </button>
            </div>
        </div>
    );
};

const inputStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
};

const btnStyle = {
    background: '#00ff88',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%'
};

export default Register;