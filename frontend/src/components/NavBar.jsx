import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { gsap } from 'gsap';
import AccountDropdown from './AccountDropdown';

const NAV_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

.ca-nav-link {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  transition: color 0.2s;
}
.ca-nav-link:hover { color: #5ed29c; }

.ca-mobile-menu {
  position: fixed;
  inset: 0;
  background: rgba(7,11,10,0.97);
  backdrop-filter: blur(20px);
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.ca-mobile-link {
  font-family: 'Inter', sans-serif;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  transition: color 0.2s;
}
.ca-mobile-link:hover { color: #5ed29c; }
`;

function injectStyles() {
    if (document.getElementById('ca-nav-styles')) return;
    const el = document.createElement('style');
    el.id = 'ca-nav-styles';
    el.textContent = NAV_STYLES;
    document.head.appendChild(el);
}

export default function NavBar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const accountClose = useCallback(() => setAccountOpen(false), []);

    useEffect(() => { injectStyles(); }, []);

    const NAV_LINKS = [
        { label: 'LEADERBOARD', to: '/leaderboard' },
        { label: 'PLAY', to: '/lobby' },
    ];

    return (
        <>
            <header style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '28px 48px',
            }}>
                <Link to="/" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '17px',
                    fontWeight: 800,
                    letterSpacing: '0.18em',
                    color: '#ffffff',
                    textDecoration: 'none',
                }}>
                    CODE ARENA
                </Link>

                <nav style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
                    {NAV_LINKS.map(l => (
                        <Link key={l.label} to={l.to} className="ca-nav-link">{l.label}</Link>
                    ))}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="ca-nav-link"
                            onClick={() => {
                                if (localStorage.getItem('userId')) {
                                    setAccountOpen(a => !a);
                                } else {
                                    navigate('/login');
                                }
                            }}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 6, padding: 0,
                            }}
                            aria-label="Account"
                        >
                            <User size={15} strokeWidth={2} />
                            ACCOUNT
                        </button>
                        <AccountDropdown open={accountOpen} onClose={accountClose} />
                    </div>
                </nav>

                <button
                    onClick={() => setMenuOpen(true)}
                    style={{
                        display: 'none',
                        background: 'none', border: 'none',
                        color: '#fff', cursor: 'pointer', padding: 4,
                    }}
                    className="ca-hamburger"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
            </header>

            {menuOpen && (
                <div className="ca-mobile-menu">
                    <button
                        onClick={() => setMenuOpen(false)}
                        style={{
                            position: 'absolute', top: 28, right: 32,
                            background: 'none', border: 'none',
                            color: '#fff', cursor: 'pointer',
                        }}
                        aria-label="Close menu"
                    >
                        <X size={28} />
                    </button>
                    {NAV_LINKS.map(l => (
                        <Link
                            key={l.label}
                            to={l.to}
                            className="ca-mobile-link"
                            onClick={() => setMenuOpen(false)}
                        >
                            {l.label}
                        </Link>
                    ))}
                    <Link to="/login" className="ca-mobile-link" onClick={() => setMenuOpen(false)}>
                        LOGIN
                    </Link>
                </div>
            )}
        </>
    );
}
