import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function SeatForm() {
    const [email, setEmail] = useState('');
    const [seatNumber, setSeatNumber] = useState('');
    const [holdCode, setHoldCode] = useState('');
    const [message, setMessage] = useState('');

    const handleHold = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:4000/seats/hold', { email, seat_number: Number(seatNumber) });
            setMessage(`Hold placed! Code: ${res.data.result[0].hold_code}`);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    const handleConfirm = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:4000/seats/confirm', { email, hold_code: holdCode });
            setMessage('Seat confirmed successfully');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    return (
        <div className='App'>
            <h2>Seat Reservation</h2>
            <form onSubmit={handleHold}>
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Seat Number:
                    <input type="number" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} required />
                </label>
                <button type="submit">Place Hold</button>
            </form>

            <form onSubmit={handleConfirm}>
                <label>
                    Hold Code:
                    <input type="text" value={holdCode} onChange={(e) => setHoldCode(e.target.value)} required />
                </label>
                <button type="submit">Confirm Hold</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default SeatForm;