import React from 'react';

const EraserPalette = ({ brushSize, setBrushSize }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '10px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>지우개</h4>
      
      <div>
        <label style={{ fontSize: '14px', marginBottom: '5px', display: 'block' }}>
          지우개 크기: {brushSize}x{brushSize}
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default EraserPalette;