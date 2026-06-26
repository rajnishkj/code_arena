import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Lobby = () => {
    const [userId, setUserId] = useState('');
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    const joinQueue = async () => {
        setStatus('Searching for opponent...');
        await API.post('/matchmaking/join', null, { params: { userId } });

        const interval = setInterval(async () => {
            const res = await API.post('/matchmaking/match', null, {
                params: { userId, problemId: 1 }
            });

            if (res.data && res.data.id) {
                clearInterval(interval);
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
        <div>
            <h2>Lobby</h2>
            <input
                placeholder="Enter your User ID"
                value={userId}
                onChange={e => setUserId(e.target.value)}
            />
            <button onClick={joinQueue}>Find Match</button>
            <p>{status}</p>
        </div>
    );
};

export default Lobby;