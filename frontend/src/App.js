import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Leaderboard from './pages/Leaderboard';
import Match from './pages/Match';
import Lobby from './pages/Lobby';

function App() {
  return (
      <Router>
        <nav>
          <Link to="/register">Register</Link> |
          <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/lobby">Lobby</Link>

        </nav>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/match" element={<Match />} />
            <Route path="/lobby" element={<Lobby />} />
        </Routes>
      </Router>
  );
}

export default App;