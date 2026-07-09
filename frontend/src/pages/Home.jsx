import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Hls from 'hls.js';
import { gsap } from 'gsap';
import NavBar from '../components/NavBar';
import API from '../services/api';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const HLS_STREAM_URL =
    'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

// ─── STYLES (injected once) ───────────────────────────────────────────────────
const FONT_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@700&family=Instrument+Serif:ital@0;1&display=swap');

.ca-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #5ed29c;
  color: #070b0a;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 14px 28px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 0 24px rgba(94,210,156,0.35);
}
.ca-cta-btn:hover {
  background: #79e8b4;
  transform: translateY(-1px);
  box-shadow: 0 0 36px rgba(94,210,156,0.55);
}

.ca-glass-card::before {
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

@keyframes floatCard {
  0%, 100% { transform: translateY(-50px) translateY(0px); }
  50%       { transform: translateY(-50px) translateY(-10px); }
}

@media (max-width: 768px) {
  .ca-grid-lines { display: none !important; }
  .ca-headline { font-size: 42px !important; }
  .ca-desc { font-size: 13px !important; }
}
`;

function injectStyles() {
    if (document.getElementById('ca-home-styles')) return;
    const el = document.createElement('style');
    el.id = 'ca-home-styles';
    el.textContent = FONT_STYLE;
    document.head.appendChild(el);
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Home() {
    const videoRef = useRef(null);
    const spotlightRef = useRef(null);
    const navigate = useNavigate();
    const [visitCount, setVisitCount] = useState(null);
    const visitCounted = useRef(false);

    // Visit counter
    useEffect(() => {
        if (visitCounted.current) return;
        visitCounted.current = true;
        API.post('/visits').then(res => setVisitCount(res.data.count)).catch(() => {});
    }, []);

    // Character trail
    useEffect(() => {
        const CHARS = '{}[]()<>/;:=*&#@!?01+-~|^%$\'"\\`';
        let lastSpawn = 0;
        const THROTTLE = 40; // ms between spawns

        const onTrail = (e) => {
            const now = Date.now();
            if (now - lastSpawn < THROTTLE) return;
            lastSpawn = now;

            const char = CHARS[Math.floor(Math.random() * CHARS.length)];
            const el = document.createElement('span');
            el.textContent = char;
            // Slight random horizontal offset so chars don't stack exactly
            const offsetX = (Math.random() - 0.5) * 24;
            Object.assign(el.style, {
                position: 'fixed',
                left: `${e.clientX + offsetX}px`,
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

    // Inject fonts + styles
    useEffect(() => { injectStyles(); }, []);

    // HLS video
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: false });
            hls.loadSource(HLS_STREAM_URL);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => { });
            });
            return () => hls.destroy();
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS
            video.src = HLS_STREAM_URL;
            video.play().catch(() => { });
        }
    }, []);

    return (
        <div style={{ position: 'relative', minHeight: '100vh', overflow: 'auto', fontFamily: 'Inter, sans-serif' }}>

            {/* ── Video Background ── */}
            <video
                ref={videoRef}
                muted
                loop
                playsInline
                style={{
                    position: 'fixed',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 1,
                    zIndex: 0,
                }}
            />

            {/* ── Cursor Spotlight Overlay ── *
            <div
                ref={spotlightRef}
                style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: 'rgba(7,11,10,0.82)',
                    pointerEvents: 'none',
                    transition: 'background 0.05s linear',
                }}
            />
            */}

            {/* ── Gradient Overlays ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: 'linear-gradient(to right, #070b0a 0%, transparent 55%)',
            }} />
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: 'linear-gradient(to top, #070b0a 0%, transparent 50%)',
            }} />
            

            {/* ── Central Glow ── */}
            <svg
                style={{
                    position: 'absolute', top: 0, left: '50%',
                    transform: 'translateX(-50%)',
                    width: '900px', height: '320px',
                    zIndex: 2, pointerEvents: 'none',
                    overflow: 'visible',
                }}
                aria-hidden="true"
            >
                <defs>
                    <filter id="glow-blur">
                        <feGaussianBlur stdDeviation="25" result="blur" />
                    </filter>
                </defs>
                <ellipse
                    cx="450" cy="60" rx="420" ry="80"
                    fill="rgba(0,200,130,0.18)"
                    filter="url(#glow-blur)"
                />
            </svg>

            <NavBar />

            {/* ── Hero Content ── */}
            <main style={{
                position: 'relative', zIndex: 10,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 48px',
                maxWidth: '860px',
            }}>

                {/* ── Liquid Glass Card ── */}
                <div
                    className="ca-glass-card"
                    style={{
                        position: 'relative',
                        width: 200,
                        height: 200,
                        borderRadius: 20,
                        background: 'rgba(255,255,255,0.01)',
                        backgroundBlendMode: 'luminosity',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.10)',
                        padding: '22px 20px',
                        marginBottom: 0,
                        animation: 'floatCard 4s ease-in-out infinite',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        gap: 10,
                        transform: 'translateY(-50px)',
                    }}
                >
                    <span style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: 'rgba(255,255,255,0.5)',
                    }}>
                        [ 2026 ]
                    </span>
                    <p style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: '#fff',
                        margin: 0,
                        lineHeight: 1.35,
                    }}>
                        Recommended by{' '}
                        <em style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: '#5ed29c' }}>
                            Striver, Neetcode, Love Babbar, CodeWithHarry...
                        </em>{' '}

                    </p>
                    <p style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.5)',
                        margin: 0,
                        lineHeight: 1.6,
                    }}>
                        Real problems. Real pressure. Real skill.
                        Built for programmers who want to compete and grow.
                    </p>
                </div>

                {/* ── Eyebrow ── */}
                <p style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    color: '#5ed29c',
                    textTransform: 'uppercase',
                    margin: '0 0 18px 0',
                }}>
                    Real-Time Competitive Coding
                </p>

                {/* ── Main Headline ── */}
                <h1
                    className="ca-headline"
                    style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 72,
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        textTransform: 'uppercase',
                        color: '#ffffff',
                        margin: '0 0 22px 0',
                        lineHeight: 1.05,
                    }}
                >
                    BATTLE. CODE.{' '}
                    <span style={{ color: '#5ed29c' }}>CLIMB.</span>
                </h1>

                {/* ── Description ── */}
                <p
                    className="ca-desc"
                    style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 14,
                        color: 'rgba(255,255,255,0.70)',
                        maxWidth: 512,
                        lineHeight: 1.75,
                        margin: '0 0 36px 0',
                    }}
                >
                    Jump into live 1v1 coding duels. Solve under pressure, climb the Elo ladder,
                    and prove your skills against real opponents — in real time.
                </p>

                {/* ── CTA ── */}
                <div>
                    <button
                        className="ca-cta-btn"
                        onClick={() => navigate('/lobby')}
                    >
                        Get Started
                        <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </main>

            {/* ── Visit Counter ── */}
            {visitCount !== null && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24,
                    zIndex: 150,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.15)',
                    letterSpacing: '0.04em',
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}>
                    Visits: {visitCount}
                </div>
            )}

            {/* ── About Section ── */}
            <section style={{
                position: 'relative', zIndex: 10,
                padding: '100px 48px 120px',
                maxWidth: 740,
                margin: '0 auto',
                fontFamily: "'Courier New', Courier, monospace",
            }}>
                <div style={{
                    background: 'rgba(7,11,10,0.85)',
                    borderRadius: 16,
                    padding: '48px 56px',
                }}>
                    <p style={{ color: '#5ed29c', fontSize: 11, letterSpacing: '0.16em', marginBottom: 8 }}>
                        
                    </p>

                    <h1 style={{
                        fontSize: 36, fontWeight: 700, color: '#fff', margin: 0, marginBottom: 4,
                    }}>
                        About.md
                    </h1>

                    <p style={{ color: '#5ed29c', fontSize: 13, marginBottom: 60 }}>
                        A Real-Time 1v1 Coding Duel Platform
                    </p>

                    {/* HOW IT WORKS */}
                    <h2 style={{ color: '#5ed29c', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                        (⌐■_■)
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.80)', fontSize: 14, lineHeight: 1.8, marginBottom: 48 }}>
                        Code Arena is a competitive coding platform where you face real opponents in
                        real-time 1v1 duels. When you join a match, both you and your opponent receive
                        the same problem. The first to submit a correct solution wins. Every match
                        updates your Elo rating, so every victory and defeat directly impacts your
                        rank on the leaderboard. It's just you, your code, and the clock.
                    </p>


                    {/* GETTING STARTED */}
                    <h2 style={{ color: '#5ed29c', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                        🏁 
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.80)', fontSize: 14, lineHeight: 1.8, marginBottom: 48 }}>
                        To begin, create an account and set your username. Browse the leaderboard to
                        see the top competitors and understand the ranking system. When you're ready,
                        head to the Lobby to queue for a match. The system will find an opponent at a
                        similar Elo, present you both with the same problem, and the duel begins.
                        After the match, your rating is automatically updated — win or lose, you'll
                        see exactly where you stand.
                    </p>
                    
                    <div style={{
                        marginTop: 80, height: 1,
                        background: 'rgba(255,255,255,0.06)',
                    }} />

                    <p style={{
                        marginTop: 24, fontSize: 11,
                        color: 'rgba(255,255,255,0.15)',
                        textAlign: 'center',
                    }}>
                        // end of about.md
                    </p>
                </div>
            </section>
        </div>
    );
}
