import React from 'react';
import { BRUSH_TYPES } from '../../constants/objectTypes';
import { happyBrush } from '../../utils/happyIslandBrush';
import './TriangleBrushPanel.css';

const TriangleBrushPanel = ({
  currentBrushType,
  onBrushTypeChange,
  brushSize,
  onBrushSizeChange
}) => {
  const handleSizeIncrease = () => {
    happyBrush.incrementBrush();
    onBrushSizeChange(happyBrush.brushSize, happyBrush.rawBrushSize);
  };

  const handleSizeDecrease = () => {
    happyBrush.decrementBrush();
    onBrushSizeChange(happyBrush.brushSize, happyBrush.rawBrushSize);
  };

  const handleBrushTypeChange = (type) => {
    happyBrush.brushType = type;
    onBrushTypeChange(type);
  };

  const getBrushSizeDisplay = () => {
    if (happyBrush.rawBrushSize === 0) return '삼각형';
    if (currentBrushType === BRUSH_TYPES.ROUNDED) {
      if (happyBrush.brushSize === 1) return '1x1 사각형';
      if (happyBrush.brushSize === 2) return '2x2 다이아몬드';
      return `${happyBrush.brushSize}x${happyBrush.brushSize} 팔각형`;
    }
    return `${happyBrush.brushSize}x${happyBrush.brushSize} 사각형`;
  };

  return (
    <div className="triangle-brush-panel">
      <h4>브러시 타입</h4>
      <div className="brush-type-controls">
        <button
          className={`brush-type-btn ${currentBrushType === BRUSH_TYPES.ROUNDED ? 'active' : ''}`}
          onClick={() => handleBrushTypeChange(BRUSH_TYPES.ROUNDED)}
        >
          🔵 둥근
        </button>
        <button
          className={`brush-type-btn ${currentBrushType === BRUSH_TYPES.SQUARE ? 'active' : ''}`}
          onClick={() => handleBrushTypeChange(BRUSH_TYPES.SQUARE)}
        >
          ⬜ 사각
        </button>
      </div>

      <h4>브러시 크기</h4>
      <div className="brush-size-controls">
        <button className="size-btn" onClick={handleSizeDecrease}>-</button>
        <div className="size-display">{getBrushSizeDisplay()}</div>
        <button className="size-btn" onClick={handleSizeIncrease}>+</button>
      </div>
      <div className="size-info">
        크기 0 = 삼각형, 1+ = 일반 브러시
      </div>
    </div>
  );
};

export default TriangleBrushPanel;