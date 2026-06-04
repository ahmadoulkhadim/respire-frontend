import React from 'react';

const ScoreCard = ({ score, polluant, unite }) => {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '20px',
      maxWidth: '300px',
      fontFamily: 'sans-serif'
    }}>
      <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
        🚬 Ton exposition du jour
      </p>
      <h2 style={{ fontSize: '32px', color: '#c0392b', margin: '8px 0 4px' }}>
        {score} cigarettes
      </h2>
      <p style={{ fontSize: '12px', color: '#64748b' }}>
        {polluant} : {unite}
      </p>
    </div>
  );
};

export default ScoreCard;