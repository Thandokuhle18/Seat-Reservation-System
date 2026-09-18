import React, { useState } from 'react';
import SeatMapScreen from './SeatMapScreen';
import ManageHoldScreen from './ManageHoldScreen';
import EventLogScreen from './EventLogScreen';
import './App.css';

function App() {
  const [screen, setScreen] = useState('seatmap');

  return (
    <div className="App">
      <nav>
        <button onClick={() => setScreen('seatmap')}>Seat Map</button>
        <button onClick={() => setScreen('manage')}>Manage Hold</button>
        <button onClick={() => setScreen('log')}>Event Log</button>
      </nav>

      {screen === 'seatmap' && <SeatMapScreen />}
      {screen === 'manage' && <ManageHoldScreen />}
      {screen === 'log' && <EventLogScreen />}
    </div>
  );
}

export default App;