import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { gsap } from 'gsap';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const containerRef = useRef(null);
    const rowsRef = useRef([]);

    useEffect(() => {
        API.get('/users/leaderboard').then(res => {
            setUsers(res.data);
        });
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
    }, []);

    useEffect(() => {
        if (users.length > 0) {
            gsap.fromTo(rowsRef.current,
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
            );
        }
    }, [users]);

    const rankColor = (i) => {
        if (i === 0) return '#FFD700';
        if (i === 1) return '#C0C0C0';
        if (i === 2) return '#CD7F32';
        return '#888';
    };

    const rankIcon = (i) => {
        if (i === 0) return '🥇';
        if (i === 1) return '🥈';
        if (i === 2) return '🥉';
        return `#${i + 1}`;
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '40px 16px'
        }}>
            <div ref={containerRef} style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '40px',
                width: '100%',
                maxWidth: '600px'
            }}>
                <h2 style={{ color: '#00ff88', textAlign: 'center', margin: '0 0 32px', fontSize: '28px' }}>
                    🏆 Leaderboard
                </h2>

                {users.map((user, index) => (
                    <div
                        key={user.id}
                        ref={el => rowsRef.current[index] = el}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 20px',
                            marginBottom: '10px',
                            borderRadius: '10px',
                            background: index < 3 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${index < 3 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
                            cursor: 'default'
                        }}
                        onMouseEnter={e => gsap.to(e.currentTarget, { x: 6, duration: 0.2 })}
                        onMouseLeave={e => gsap.to(e.currentTarget, { x: 0, duration: 0.2 })}
                    >
                        <span style={{ width: '40px', fontWeight: 'bold', color: rankColor(index), fontSize: '18px' }}>
                            {rankIcon(index)}
                        </span>
                        <span style={{ flex: 1, color: '#fff', fontWeight: index < 3 ? 'bold' : 'normal' }}>
                            {user.username}
                        </span>
                        <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                            {user.elo} ELO
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;