import React from 'react';
import { PAINT_COLORS } from '../../constants/objectTypes';

const PaintPalette = ({ selectedColor, onColorSelect, brushSize, setBrushSize }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '10px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>페인트 색상</h4>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        marginBottom: '15px'
      }}>
        {Object.values(PAINT_COLORS).map(color => (
          <button
            key={color.id}
            onClick={() => onColorSelect(color)}
            style={{
              padding: '8px',
              border: selectedColor?.id === color.id ? '3px solid #333' : '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: color.color,
              color: 'white',
              textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {color.name}
          </button>
        ))}
      </div>
      
      <div>
        <label style={{ fontSize: '14px', marginBottom: '5px', display: 'block' }}>
          브러시 크기: {brushSize}x{brushSize}
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

export default PaintPalette;