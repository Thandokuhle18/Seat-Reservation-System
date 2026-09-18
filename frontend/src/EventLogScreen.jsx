import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EventLogScreen() {
    const [logs, setLogs] = useState([]);
    const [filterSeat, setFilterSeat] = useState('');

    useEffect(() => {
        axios.get('http://localhost:4000/seats/logs').then(res => setLogs(res.data.result));
    }, []);

    const filteredLogs = filterSeat 
        ? logs.filter(l => l.seat_number === Number(filterSeat))
        : logs;

    return (
        <div>
            <h2>Event Log</h2>
            <input type="number" placeholder="Filter by Seat" value={filterSeat} onChange={e => setFilterSeat(e.target.value)} />
            <ul>
                {filteredLogs.map((log, index) => (
                    <li key={index}>
                        {new Date(log.timestamp).toLocaleTimeString()} - **{log.event_type}** (Seat: {log.seat_number || 'N/A'}, Email: {log.email || 'N/A'}, Code: {log.hold_code || 'N/A'})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EventLogScreen;