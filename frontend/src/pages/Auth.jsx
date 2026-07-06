import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { gsap } from 'gsap';
import API from '../services/api';
import NavBar from '../components/NavBar';

const HLS_STREAM_URL =
    'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

// Shared styles — mirrors Home's ca-glass-card + fonts
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

.auth-glass-card {
  position: relative;
  background: rgba(255,255,255,0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.10);
  border-radius: 20px;
}
.auth-glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1.4px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.auth-input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 10px;
  padding: 13px 16px;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s, background 0.2s;
}
.auth-input:focus {
  border-color: #5ed29c;
  background: rgba(94,210,156,0.06);
}
.auth-input::placeholder { color: rgba(255,255,255,0.25); }

.auth-confirm-wrap {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.35s ease;
}
.auth-confirm-wrap.open { max-height: 60px; }

.auth-btn-signup {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(94,210,156,0.4);
  background: transparent;
  color: #5ed29c;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background 0.2s;
}
.auth-btn-signup:hover { background: rgba(94,210,156,0.1); border-color: #5ed29c; }

.auth-btn-login {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #5ed29c;
  color: #070b0a;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  box-shadow: 0 0 18px rgba(94,210,156,0.3);
}
.auth-btn-login:hover { background: #79e8b4; transform: translateY(-1px); }

.auth-err { font-family:'Inter',sans-serif; font-size:12px; color:#ff6b6b; text-align:center; min-height:16px; }
.auth-ok  { font-family:'Inter',sans-serif; font-size:12px; color:#5ed29c; text-align:center; min-height:16px; }
`;

function injectStyles() {
    if (document.getElementById('auth-gl-styles')) return;
    const el = document.createElement('style');
    el.id = 'auth-gl-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
}

export default function Auth() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const cardRef = useRef(null);

    const [mode, setMode] = useState(null);       // null | 'login' | 'signup'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [msg, setMsg] = useState({ text: '', ok: false });
    const [loading, setLoading] = useState(false);

    // Styles
    useEffect(() => { injectStyles(); }, []);

    // HLS video — identical to Home
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: false });
            hls.loadSource(HLS_STREAM_URL);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => { }));
            return () => hls.destroy();
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = HLS_STREAM_URL;
            video.play().catch(() => { });
        }
    }, []);

    // Card entrance
    useEffect(() => {
        if (cardRef.current) {
            gsap.fromTo(cardRef.current,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );
        }
    }, []);

    // Character trail
    useEffect(() => {
        const CHARS = '{}[]()<>/;:=*&#@!?01+-~|^%$';
        let last = 0;
        const onTrail = (e) => {
            const now = Date.now();
            if (now - last < 40) return;
            last = now;
            const el = document.createElement('span');
            el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
            const ox = (Math.random() - 0.5) * 24;
            Object.assign(el.style, {
                position: 'fixed',
                left: `${e.clientX + ox}px`,
                top: `${e.clientY}px`,
                color: '#5ed29c',
                fontFamily: 'monospace',
                fontSize: `${Math.floor(Math.random() * 8) + 11}px`,
                fontWeight: '700',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 9999,
                opacity: 1,
                transform: 'translateX(-50%)',
            });
            document.body.appendChild(el);
            gsap.to(el, {
                y: 55 + Math.random() * 30,
                opacity: 0,
                duration: 0.7 + Math.random() * 0.4,
                ease: 'power1.out',
                onComplete: () => el.remove(),
            });
        };
        window.addEventListener('mousemove', onTrail);
        return () => window.removeEventListener('mousemove', onTrail);
    }, []);

    const setError = (t) => setMsg({ text: t, ok: false });
    const setOk = (t) => setMsg({ text: t, ok: true });

    const handleLogin = async () => {
        if (!username || !password) return setError('Enter username and password.');
        setLoading(true); setMode('login'); setMsg({ text: '', ok: false });
        try {
            const res = await API.post('/users/login', { username, password });
            localStorage.setItem('username', res.data.username);
            localStorage.setItem('userId', res.data.id);
            setOk('Welcome back, ' + res.data.username + '!');
            setTimeout(() => navigate('/lobby'), 800);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed.');
        } finally { setLoading(false); }
    };

    const handleSignup = async () => {
        if (!username || !password) return setError('Enter username and password.');
        if (password !== confirm) return setError('Passwords do not match.');
        if (password.length < 4) return setError('Password min 4 chars.');
        setLoading(true); setMsg({ text: '', ok: false });
        try {
            await API.get(`/users/${username}`);
            setError('Username already taken.');
            setLoading(false);
        } catch (checkErr) {
            if (checkErr.response?.status === 404) {
                try {
                    const res = await API.post('/users/register', {
                        username,
                        encrypted_password: password,
                        elo: 1200,
                        total_game_time: 0,
                    });
                    localStorage.setItem('username', res.data.username);
                    localStorage.setItem('userId', res.data.id);
                    setOk('Account created! Entering arena…');
                    setTimeout(() => navigate('/lobby'), 800);
                } catch (regErr) {
                    setError(regErr.response?.data?.error || 'Registration failed.');
                }
            } else {
                setError('Could not verify username.');
            }
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#070b0a' }}>

            {/* ── Video Background ── */}
            <video ref={videoRef} muted loop playsInline style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', opacity: 0.6, zIndex: 0,
            }} />

            {/* ── Gradient Overlays ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: 'linear-gradient(to right, #070b0a 0%, transparent 55%)'
            }} />
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: 'linear-gradient(to top, #070b0a 0%, transparent 50%)'
            }} />

            {/* ── Central Glow ── */}
            <svg style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: '900px', height: '320px',
                zIndex: 2, pointerEvents: 'none', overflow: 'visible',
            }} aria-hidden="true">
                <defs>
                    <filter id="auth-glow-blur">
                        <feGaussianBlur stdDeviation="25" result="blur" />
                    </filter>
                </defs>
                <ellipse cx="450" cy="60" rx="420" ry="80"
                    fill="rgba(0,200,130,0.18)" filter="url(#auth-glow-blur)" />
            </svg>

            <NavBar />

            {/* ── Centered Card ── */}
            <div style={{
                position: 'relative', zIndex: 10,
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
            }}>
                <div ref={cardRef} className="auth-glass-card" style={{
                    width: '100%',
                    maxWidth: 360,
                    padding: '36px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                }}>
                    {/* Card header — mirrors Home's glass card tag */}
                    <span style={{
                        fontSize: 13, fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: 'rgba(255,255,255,0.5)',
                    }}>[ CODE ARENA ]</span>

                    <p style={{
                        fontSize: 20, fontWeight: 700,
                        color: '#fff', margin: 0, lineHeight: 1.25,
                    }}>
                        {mode === 'signup' ? 'Create account' : mode === 'login'
                            ? <>Welcome{' '}<em style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: '#5ed29c' }}>back</em></>
                            : <>Enter the{' '}<em style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: '#5ed29c' }}>Arena</em></>
                        }
                    </p>

                    <p style={{
                        fontSize: 11, color: 'rgba(255,255,255,0.4)',
                        margin: '0 0 6px', lineHeight: 1.6,
                    }}>
                        Battle. Code. Climb.
                    </p>

                    {/* Fields */}
                    <input
                        className="auth-input"
                        placeholder="Username"
                        value={username}
                        onChange={e => { setUsername(e.target.value); setMsg({ text: '', ok: false }); }}
                        autoComplete="username"
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setMsg({ text: '', ok: false }); }}
                        onKeyDown={e => { if (e.key === 'Enter' && mode === 'login') handleLogin(); }}
                        autoComplete="current-password"
                    />

                    {/* Confirm — slides in for signup */}
                    <div className={`auth-confirm-wrap${mode === 'signup' ? ' open' : ''}`}>
                        <input
                            className="auth-input"
                            type="password"
                            placeholder="Confirm password"
                            value={confirm}
                            onChange={e => { setConfirm(e.target.value); setMsg({ text: '', ok: false }); }}
                            onKeyDown={e => { if (e.key === 'Enter' && mode === 'signup') handleSignup(); }}
                            autoComplete="new-password"
                        />
                    </div>

                    {/* Message */}
                    <p className={msg.ok ? 'auth-ok' : 'auth-err'}>{msg.text}</p>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="auth-btn-signup" disabled={loading}
                            onClick={() => {
                                if (mode !== 'signup') { setMode('signup'); setMsg({ text: '', ok: false }); }
                                else handleSignup();
                            }}>
                            {mode === 'signup' ? (loading ? '…' : 'CREATE') : 'SIGN UP'}
                        </button>
                        <button className="auth-btn-login" disabled={loading}
                            onClick={handleLogin}>
                            {loading && mode === 'login' ? '…' : 'LOGIN'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
