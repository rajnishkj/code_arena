import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Hls from 'hls.js';
import { gsap } from 'gsap';
import API from '../services/api';

const HLS_STREAM_URL =
    'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

.lobby-glass-card {
  position: relative;
  background: rgba(255,255,255,0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.10);
  border-radius: 20px;
}
.lobby-glass-card::before {
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

.lobby-input {
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
.lobby-input:focus {
  border-color: #5ed29c;
  background: rgba(94,210,156,0.06);
}
.lobby-input::placeholder { color: rgba(255,255,255,0.25); }

.lobby-btn {
  width: 100%;
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
.lobby-btn:hover:not(:disabled) { background: #79e8b4; transform: translateY(-1px); }
.lobby-btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;

function injectStyles() {
    if (document.getElementById('lobby-gl-styles')) return;
    const el = document.createElement('style');
    el.id = 'lobby-gl-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
}

export default function Lobby() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const cardRef = useRef(null);
    const statusRef = useRef(null);

    const [userId, setUserId] = useState('');
    const [status, setStatus] = useState('');
    const [searching, setSearching] = useState(false);

    // Styles
    useEffect(() => { injectStyles(); }, []);

    // HLS video
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

    // Status pulse
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

            {/* ── Vertical Grid Lines ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
            }}>
                {[25, 50, 75].map(pct => (
                    <div key={pct} style={{
                        position: 'absolute',
                        left: `${pct}%`,
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        background: 'rgba(255,255,255,0.07)',
                    }} />
                ))}
            </div>

            {/* ── Central Glow ── */}
            <svg style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: '900px', height: '320px',
                zIndex: 2, pointerEvents: 'none', overflow: 'visible',
            }} aria-hidden="true">
                <defs>
                    <filter id="lobby-glow-blur">
                        <feGaussianBlur stdDeviation="25" result="blur" />
                    </filter>
                </defs>
                <ellipse cx="450" cy="60" rx="420" ry="80"
                    fill="rgba(0,200,130,0.18)" filter="url(#lobby-glow-blur)" />
            </svg>

            {/* ── Nav ── */}
            <header style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                zIndex: 100, display: 'flex',
                alignItems: 'center', justifyContent: 'space-between',
                padding: '28px 48px',
            }}>
                <Link to="/" style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 17,
                    fontWeight: 800, letterSpacing: '0.18em',
                    color: '#fff', textDecoration: 'none',
                }}>CODE ARENA</Link>

                <nav style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
                    <Link to="/leaderboard" style={{
                        fontFamily: 'Inter, sans-serif', fontSize: 15,
                        fontWeight: 600, letterSpacing: '0.08em',
                        color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
                        transition: 'color 0.2s',
                    }}
                        onMouseEnter={e => e.target.style.color = '#5ed29c'}
                        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.75)'}
                    >LEADERBOARD</Link>
                </nav>
            </header>

            {/* ── Centered Card ── */}
            <div style={{
                position: 'relative', zIndex: 10,
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
            }}>
                <div ref={cardRef} className="lobby-glass-card" style={{
                    width: '100%',
                    maxWidth: 360,
                    padding: '36px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                }}>
                    <span style={{
                        fontSize: 13, fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: 'rgba(255,255,255,0.5)',
                    }}>[ FIND MATCH ]</span>

                    <p style={{
                        fontSize: 20, fontWeight: 700,
                        color: '#fff', margin: 0, lineHeight: 1.25,
                    }}>
                        Enter the{' '}
                        <em style={{
                            fontFamily: 'Instrument Serif, serif',
                            fontStyle: 'italic', color: '#5ed29c',
                        }}>Arena</em>
                    </p>

                    <p style={{
                        fontSize: 11, color: 'rgba(255,255,255,0.4)',
                        margin: 0, lineHeight: 1.6,
                    }}>
                        Enter your ID to join the queue
                    </p>

                    <input
                        className="lobby-input"
                        placeholder="Enter your User ID"
                        value={userId}
                        onChange={e => setUserId(e.target.value)}
                    />

                    <button
                        className="lobby-btn"
                        onClick={joinQueue}
                        disabled={searching}
                    >
                        {searching ? 'Searching...' : 'Find Match'}
                    </button>

                    {status && (
                        <p ref={statusRef} style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 12, color: '#5ed29c',
                            textAlign: 'center', margin: 0,
                        }}>{status}</p>
                    )}

                    <p style={{
                        textAlign: 'center', margin: '4px 0 0',
                        fontSize: 11, color: 'rgba(255,255,255,0.2)',
                    }}>
                        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}
                            onMouseEnter={e => e.target.style.color = '#5ed29c'}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}
                        >← Back to home</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
