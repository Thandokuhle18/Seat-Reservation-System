import React, { useState } from 'react';
import axios from 'axios';

function ManageHoldScreen() {
    const [email, setEmail] = useState('');
    const [holdCode, setHoldCode] = useState('');
    const [message, setMessage] = useState('');

    const handleAction = async (endpoint) => {
        try {
            const res = await axios.post(`http://localhost:4000/seats/${endpoint}`, { email, hold_code: holdCode });
            setMessage(`Success: ${res.data.result[0].message || 'Done'}`);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    return (
        <div>
            <h2>Manage Hold</h2>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="text" placeholder="Hold Code" value={holdCode} onChange={e => setHoldCode(e.target.value)} />
            <br />
            <button onClick={() => handleAction('confirm')}>Confirm</button>
            <button onClick={() => handleAction('extend')}>Extend</button>
            <button onClick={() => handleAction('release')}>Release</button>
            <p>{message}</p>
        </div>
    );
}

export default ManageHoldScreen;