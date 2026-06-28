import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import createWebSocketClient from '../services/websocket';
import API from '../services/api';

const Match = () => {
    const location = useLocation();
    const { matchId, userId, problemId } = location.state || {};

    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(300);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('testcases');

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
    }, [problemId]);

    const [leftWidth, setLeftWidth] = useState(45);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = () => setIsDragging(true);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const percent = (e.clientX / window.innerWidth) * 100;
            if (percent > 20 && percent < 80) setLeftWidth(percent);
        };
        const handleMouseUp = () => setIsDragging(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const [editorHeight, setEditorHeight] = useState(60);
    const [isDraggingVertical, setIsDraggingVertical] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingVertical) {
                const rightPanel = document.getElementById('right-panel');
                const rect = rightPanel.getBoundingClientRect();
                const percent = ((e.clientY - rect.top) / rect.height) * 100;
                if (percent > 20 && percent < 85) setEditorHeight(percent);
            }
        };
        const handleMouseUp = () => setIsDraggingVertical(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingVertical]);

    const handleSubmit = async () => {
        try {
            const results = await Promise.all(
                sampleTestCases.map(async (tc) => {
                    const judgeRes = await API.post(
                        `/judge/execute?language=python&version=3.10.0&stdin=${encodeURIComponent(tc.input)}`,
                        code,
                        { headers: { 'Content-Type': 'text/plain' } }
                    );
                    console.log(typeof judgeRes.data, judgeRes.data);
                    return {
                        input: tc.input,
                        expected: tc.expectedOutput,
                        actual: String(judgeRes.data).trim(),
                        passed: String(judgeRes.data).trim() === tc.expectedOutput.trim()
                    };
                })
            );

            await API.post('/matches/complete', null, {
                params: {
                    matchId,
                    winner: userId,
                    p1Time: 300 - timer,
                    p2Time: 300 - timer
                }
            });

            setResult(results);
            setActiveTab('output');
        } catch (err) {
            setResult('Error: ' + err.message);
            setActiveTab('output');
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const sampleTestCases = problem?.testCases?.filter(tc => tc.sample) || [];

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'monospace', background: '#1e1e1e', color: '#d4d4d4' }}>

            {/* LEFT PANEL */}
            <div style={{ width: `${leftWidth}%`, overflowY: 'auto', padding: '24px', borderRight: '1px solid #333' }}>

                {problem ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ color: '#fff', margin: 0 }}>{problem.title}</h2>
                            <span style={{
                                padding: '2px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                background: problem.difficulty === 'EASY' ? '#1a472a' : problem.difficulty === 'MEDIUM' ? '#7c4a00' : '#4a1a1a',
                                color: problem.difficulty === 'EASY' ? '#4ec94e' : problem.difficulty === 'MEDIUM' ? '#ffa500' : '#ff4444'
                            }}>
                                {problem.difficulty}
                            </span>
                        </div>

                        <p style={{ marginTop: '16px', lineHeight: '1.6' }}>{problem.description}</p>

                        <h4 style={{ color: '#9cdcfe' }}>Input Format</h4>
                        <p>{problem.inputFormat}</p>

                        <h4 style={{ color: '#9cdcfe' }}>Output Format</h4>
                        <p>{problem.outputFormat}</p>

                        <h4 style={{ color: '#9cdcfe' }}>Constraints</h4>
                        <pre style={{ background: '#2d2d2d', padding: '10px', borderRadius: '6px' }}>{problem.constraints}</pre>

                        <h4 style={{ color: '#9cdcfe' }}>Examples</h4>
                        {sampleTestCases.map((tc, i) => (
                            <div key={i} style={{ background: '#2d2d2d', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
                                <p style={{ margin: '0 0 6px', color: '#888' }}>Example {i + 1}</p>
                                <p style={{ margin: '0 0 4px' }}><span style={{ color: '#9cdcfe' }}>Input:</span> <code>{tc.input}</code></p>
                                <p style={{ margin: 0 }}><span style={{ color: '#9cdcfe' }}>Output:</span> <code>{tc.expectedOutput}</code></p>
                            </div>
                        ))}
                    </>
                ) : (
                    <p>Loading problem...</p>
                )}
            </div>

            {/* DIVIDER */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    width: '5px',
                    cursor: 'col-resize',
                    background: isDragging ? '#555' : '#333',
                    flexShrink: 0
                }}
            />

            {/* RIGHT PANEL */}
            <div id="right-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* TOP BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #333', background: '#252526', flexShrink: 0 }}>
                    <span style={{ color: '#ffa500', fontWeight: 'bold', fontSize: '16px' }}>⏱ {formatTime(timer)}</span>
                    <button
                        onClick={handleSubmit}
                        style={{ background: '#4ec94e', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Submit
                    </button>
                </div>

                {/* EDITOR */}
                <div style={{ height: `${editorHeight}%`, overflow: 'hidden' }}>
                    <Editor
                        height="100%"
                        defaultLanguage="python"
                        value={code}
                        onChange={(value) => setCode(value)}
                        theme="vs-dark"
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                        }}
                    />
                </div>

                {/* VERTICAL DIVIDER */}
                <div
                    onMouseDown={() => setIsDraggingVertical(true)}
                    style={{
                        height: '5px',
                        cursor: 'row-resize',
                        background: isDraggingVertical ? '#555' : '#333',
                        flexShrink: 0
                    }}
                />

                {/* BOTTOM PANEL */}
                <div style={{ flex: 1, borderTop: '1px solid #333', background: '#1e1e1e', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid #333', flexShrink: 0 }}>
                        <button
                            onClick={() => setActiveTab('testcases')}
                            style={{ padding: '8px 16px', background: activeTab === 'testcases' ? '#2d2d2d' : 'transparent', color: activeTab === 'testcases' ? '#fff' : '#888', border: 'none', cursor: 'pointer' }}
                        >
                            Test Cases
                        </button>
                        <button
                            onClick={() => setActiveTab('output')}
                            style={{ padding: '8px 16px', background: activeTab === 'output' ? '#2d2d2d' : 'transparent', color: activeTab === 'output' ? '#fff' : '#888', border: 'none', cursor: 'pointer' }}
                        >
                            Output
                        </button>
                    </div>

                    <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
                        {activeTab === 'testcases' && (
                            sampleTestCases.map((tc, i) => (
                                <div key={i} style={{ marginBottom: '10px' }}>
                                    <p style={{ margin: '0 0 4px', color: '#888' }}>Case {i + 1}</p>
                                    <p style={{ margin: '0 0 2px' }}><span style={{ color: '#9cdcfe' }}>Input:</span> <code>{tc.input}</code></p>
                                    <p style={{ margin: 0 }}><span style={{ color: '#9cdcfe' }}>Expected:</span> <code>{tc.expectedOutput}</code></p>
                                </div>
                            ))
                        )}
                        {activeTab === 'output' && (
                            Array.isArray(result) ? (
                                result.map((r, i) => (
                                    <div key={i} style={{ marginBottom: '12px' }}>
                                        <p style={{ margin: '0 0 4px', color: r.passed ? '#4ec94e' : '#ff4444' }}>
                                            Case {i + 1}: {r.passed ? '✅ Passed' : '❌ Failed'}
                                        </p>
                                        <p style={{ margin: '0 0 2px' }}><span style={{ color: '#9cdcfe' }}>Input:</span> <code>{r.input}</code></p>
                                        <p style={{ margin: '0 0 2px' }}><span style={{ color: '#9cdcfe' }}>Expected:</span> <code>{r.expected}</code></p>
                                        <p style={{ margin: 0 }}><span style={{ color: '#9cdcfe' }}>Got:</span> <code>{r.actual}</code></p>
                                    </div>
                                ))
                            ) : (
                                <pre style={{ color: '#ff4444', margin: 0 }}>{result || 'No output yet.'}</pre>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}



export default Match;