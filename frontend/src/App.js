import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
      <Router>
        <nav>
          <Link to="/register">Register</Link> |
          <Link to="/leaderboard">Leaderboard</Link>
        </nav>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Router>
  );
}

export default App;