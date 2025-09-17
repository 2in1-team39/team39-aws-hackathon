import React from 'react';
import { BRUSH_TYPES } from '../../constants/objectTypes';
import './TriangleBrushPanel.css';

const TriangleBrushPanel = ({ currentBrushType, onBrushTypeChange }) => {
  const brushTypes = [
    { type: BRUSH_TYPES.SQUARE, name: '1×1 사각형', icon: '⬜' },
    { type: BRUSH_TYPES.SQUARE_2X2, name: '2×2 사각형', icon: '⬛' },
    { type: BRUSH_TYPES.DIAMOND_2X2, name: '2×2 다이아몬드', icon: '💎' }
  ];

  return (
    <div className="triangle-brush-panel">
      <h4>브러시 모양</h4>
      <div className="brush-grid">
        {brushTypes.map(brush => (
          <button
            key={brush.type}
            className={`brush-btn ${currentBrushType === brush.type ? 'active' : ''}`}
            onClick={() => onBrushTypeChange(brush.type)}
            title={brush.name}
          >
            <span className="brush-icon">{brush.icon}</span>
            <span className="brush-label">{brush.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TriangleBrushPanel;