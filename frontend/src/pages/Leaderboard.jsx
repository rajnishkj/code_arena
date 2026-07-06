import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { gsap } from 'gsap';
import API from '../services/api';
import NavBar from '../components/NavBar';

const HLS_STREAM_URL =
    'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

.lb-glass-card {
  position: relative;
  background: rgba(255,255,255,0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.10);
  border-radius: 20px;
}
.lb-glass-card::before {
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
`;

function injectStyles() {
    if (document.getElementById('lb-gl-styles')) return;
    const el = document.createElement('style');
    el.id = 'lb-gl-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
}

export default function Leaderboard() {
    const videoRef = useRef(null);
    const cardRef = useRef(null);
    const rowsRef = useRef([]);

    const [users, setUsers] = useState([]);

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

    // Fetch + card entrance
    useEffect(() => {
        API.get('/users/leaderboard').then(res => {
            setUsers(res.data);
        });
        if (cardRef.current) {
            gsap.fromTo(cardRef.current,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );
        }
    }, []);

    // Row stagger
    useEffect(() => {
        if (users.length > 0) {
            gsap.fromTo(rowsRef.current,
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
            );
        }
    }, [users]);

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
                    <filter id="lb-glow-blur">
                        <feGaussianBlur stdDeviation="25" result="blur" />
                    </filter>
                </defs>
                <ellipse cx="450" cy="60" rx="420" ry="80"
                    fill="rgba(0,200,130,0.18)" filter="url(#lb-glow-blur)" />
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
                <div ref={cardRef} className="lb-glass-card" style={{
                    width: '100%',
                    maxWidth: 520,
                    padding: '36px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                }}>
                    <span style={{
                        fontSize: 13, fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: 'rgba(255,255,255,0.5)',
                    }}>[ LEADERBOARD ]</span>

                    {users.map((user, index) => (
                        <div
                            key={user.id}
                            ref={el => rowsRef.current[index] = el}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 20px',
                                borderRadius: '12px',
                                background: index < 3 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${index < 3 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}`,
                                cursor: 'default',
                            }}
                            onMouseEnter={e => gsap.to(e.currentTarget, { x: 6, duration: 0.2 })}
                            onMouseLeave={e => gsap.to(e.currentTarget, { x: 0, duration: 0.2 })}
                        >
                            <span style={{ width: '36px', fontWeight: 'bold', color: rankColor(index), fontSize: '18px' }}>
                                {rankIcon(index)}
                            </span>
                            <span style={{ flex: 1, color: '#fff', fontWeight: index < 3 ? '700' : '400' }}>
                                {user.username}
                            </span>
                            <span style={{ color: '#5ed29c', fontWeight: '700' }}>
                                {user.elo} ELO
                            </span>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}
