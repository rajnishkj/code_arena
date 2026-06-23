import React, { useState, useEffect } from 'react';
import API from '../services/api';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        API.get('/users/leaderboard').then(res => setUsers(res.data));
    }, []);

    return (
        <div>
            <h2>Leaderboard</h2>
            <table>
                <thead>
                <tr>
                    <th>Rank</th>
                    <th>Username</th>
                    <th>Elo</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user, index) => (
                    <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>{user.username}</td>
                        <td>{user.elo}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;