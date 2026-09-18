import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SeatMapScreen() {
    const [seats, setSeats] = useState([]);
    const [email, setEmail] = useState('');
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [message, setMessage] = useState('');

    const fetchSeats = async () => {
        try {
            const res = await axios.get('http://localhost:4000/seats/all');
            setSeats(res.data.result);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSeats();
        const interval = setInterval(fetchSeats, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleHold = async () => {
        if (!email || !selectedSeat) {
            setMessage('Enter email and select a seat');
            return;
        }
        try {
            const res = await axios.post('http://localhost:4000/seats/hold', { email, seat_number: selectedSeat });
            setMessage(`Hold placed! Code: ${res.data.result[0].hold_code}`);
            fetchSeats();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    const handleJoinWaitlist = async () => {
        if (!email) {
            setMessage('Enter email to join waitlist');
            return;
        }
        try {
            const res = await axios.post('http://localhost:4000/seats/waitlist', { email });
            setMessage('Joined waitlist successfully');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    const allFull = seats.length > 0 && seats.every(s => s.status !== 'Available');

    return (
        <div>
            <h2>Seat Map</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 60px)', gap: '10px' }}>
                {seats.map(s => (
                    <button 
                        key={s.seat_number} 
                        onClick={() => setSelectedSeat(s.seat_number)}
                        style={{ backgroundColor: s.status === 'Available' ? 'green' : s.status === 'Held' ? 'orange' : 'red', color: 'white' }}
                    >
                        {s.seat_number}
                    </button>
                ))}
            </div>
            <p>Selected Seat: {selectedSeat}</p>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <br />
            {!allFull ? (
                <button onClick={handleHold}>Place Hold</button>
            ) : (
                <button onClick={handleJoinWaitlist}>Join Waitlist</button>
            )}
            <p>{message}</p>
        </div>
    );
}

export default SeatMapScreen;