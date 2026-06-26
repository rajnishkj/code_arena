import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import createWebSocketClient from '../services/websocket';
import API from '../services/api';

const Match = () => {
    const location = useLocation();
    const { matchId, userId, problemId } = location.state || {};

    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(300);
    const [result, setResult] = useState(null);

    useEffect(() => {
        API.get(`/problems/${problemId}`).then(res => setProblem(res.data));

        const client = createWebSocketClient((msg) => {
            setResult(msg);
        });

        const countdown = setInterval(() => {
            setTimer(t => {
                if (t <= 0) { clearInterval(countdown); return 0; }
                return t - 1;
            });
        }, 1000);

        return () => {
            client.deactivate();
            clearInterval(countdown);
        };
    }, []);

    const handleSubmit = async () => {
        try {
            const judgeRes = await API.post(
                `/judge/execute?language=python&version=3.10.0&stdin=`,
                code,
                { headers: { 'Content-Type': 'text/plain' } }
            );

            const output = judgeRes.data;

            await API.post('/matches/complete', null, {
                params: {
                    matchId,
                    winner: userId,
                    p1Time: 300 - timer,
                    p2Time: 300 - timer
                }
            });

            setResult(output);
        } catch (err) {
            setResult('Error: ' + err.message);
        }
    };

    return (
        <div>
            <h2>Match Arena</h2>
            <p>Time left: {timer}s</p>
            {problem && <div><h3>{problem.problem}</h3></div>}
            <textarea
                rows={15}
                cols={60}
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Write your code here..."
            />
            <br />
            <button onClick={handleSubmit}>Submit</button>
            {result && <p>Result: {JSON.stringify(result)}</p>}
        </div>
    );
};

export default Match;