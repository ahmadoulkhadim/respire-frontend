import React from 'react';
import ScoreCard from './components/ScoreCard/ScoreCard.jsx';  // ← Ajoutez .jsx

function App() {
  return (
    <div style={{ padding: '40px', background: '#f5f6fa', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: 'sans-serif', color: '#1F4E79', marginBottom: '20px' }}>
        RESPIRE — Test Frontend
      </h1>
      <ScoreCard
        score="3,2"
        polluant="PM2.5 moyen"
        unite="47 µg/m³"
      />
    </div>
  );
}

export default App;