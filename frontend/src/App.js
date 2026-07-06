import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Match from './pages/Match';
import Lobby from './pages/Lobby';

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/match" element={<Match />} />
                    <Route path="/lobby" element={<Lobby />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;