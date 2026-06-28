import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { gsap } from 'gsap';

const Lobby = () => {
    const [userId, setUserId] = useState('');
    const [status, setStatus] = useState('');
    const [searching, setSearching] = useState(false);
    const containerRef = useRef(null);
    const statusRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
    }, []);

    useEffect(() => {
        if (searching && statusRef.current) {
            gsap.to(statusRef.current, {
                opacity: 0.3, repeat: -1, yoyo: true, duration: 0.8
            });
        } else if (statusRef.current) {
            gsap.killTweensOf(statusRef.current);
            gsap.to(statusRef.current, { opacity: 1 });
        }
    }, [searching]);

    const joinQueue = async () => {
        setSearching(true);
        setStatus('Searching for opponent...');
        await API.post('/matchmaking/join', null, { params: { userId } });

        const interval = setInterval(async () => {
            const res = await API.post('/matchmaking/match', null, {
                params: { userId, problemId: 1 }
            });

            if (res.data && res.data.id) {
                clearInterval(interval);
                setSearching(false);
                navigate('/match', {
                    state: {
                        matchId: res.data.id,
                        userId: userId,
                        problemId: res.data.problemId
                    }
                });
            }
        }, 3000);
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
                gap: '16px',
                textAlign: 'center'
            }}>
                <h2 style={{ color: '#00ff88', margin: 0, fontSize: '28px' }}>⚔️ Find Match</h2>
                <p style={{ color: '#888', margin: 0 }}>Enter your ID to join the queue</p>

                <input
                    placeholder="Enter your User ID"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    style={inputStyle}
                />

                <button
                    onClick={joinQueue}
                    disabled={searching}
                    style={{ ...btnStyle, background: searching ? '#444' : '#00ff88', color: searching ? '#aaa' : '#000' }}
                    onMouseEnter={e => !searching && gsap.to(e.target, { scale: 1.05, duration: 0.2 })}
                    onMouseLeave={e => gsap.to(e.target, { scale: 1, duration: 0.2 })}
                >
                    {searching ? 'Searching...' : 'Find Match'}
                </button>

                {status && (
                    <p ref={statusRef} style={{ color: '#00ff88', margin: 0 }}>{status}</p>
                )}
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
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%'
};

export default Lobby;