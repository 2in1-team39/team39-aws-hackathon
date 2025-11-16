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
    // ROUNDED 타입일 때 크기 2로 설정
    if (type === BRUSH_TYPES.ROUNDED) {
      happyBrush.brushType = type;
      happyBrush.isTriangleBrush = false;
      if (happyBrush.rawBrushSize < 2) {
        happyBrush.rawBrushSize = 2;
        happyBrush.brushSize = 2;
      }
    }
    // SQUARE 타입일 때 크기 1로 설정
    else if (type === BRUSH_TYPES.SQUARE) {
      happyBrush.brushType = type;
      happyBrush.isTriangleBrush = false;
      happyBrush.rawBrushSize = 1;
      happyBrush.brushSize = 1;
    } else {
      happyBrush.brushType = type;
      happyBrush.isTriangleBrush = false;
    }

    onBrushTypeChange(type);
  };

  const handleTriangleDirectionSelect = (triangleType) => {
    // 삼각형 브러시 타입 선택
    happyBrush.brushType = triangleType;
    happyBrush.isTriangleBrush = true;
    happyBrush.rawBrushSize = 1;
    happyBrush.brushSize = 1;
    onBrushTypeChange(triangleType);
  };

  const getBrushSizeDisplay = () => {
    // 1x1 삼각형 브러시
    if ([BRUSH_TYPES.TRIANGLE_TL, BRUSH_TYPES.TRIANGLE_TR, BRUSH_TYPES.TRIANGLE_BL, BRUSH_TYPES.TRIANGLE_BR].includes(currentBrushType)) {
      const directionNames = {
        [BRUSH_TYPES.TRIANGLE_TL]: '좌상단',
        [BRUSH_TYPES.TRIANGLE_TR]: '우상단',
        [BRUSH_TYPES.TRIANGLE_BL]: '좌하단',
        [BRUSH_TYPES.TRIANGLE_BR]: '우하단'
      };
      return `1x1 ${directionNames[currentBrushType]}`;
    }

    if (currentBrushType === BRUSH_TYPES.SQUARE) {
      return `${happyBrush.brushSize}x${happyBrush.brushSize} 사각형`;
    }

    if (happyBrush.rawBrushSize === 0) return '삼각형';
    if (currentBrushType === BRUSH_TYPES.ROUNDED) {
      if (happyBrush.brushSize === 1) return '1x1 삼각형';
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

      <h4>1x1 삼각형</h4>
      <div className="triangle-direction-controls">
        <button
          className={`triangle-btn ${currentBrushType === BRUSH_TYPES.TRIANGLE_TL ? 'active' : ''}`}
          onClick={() => handleTriangleDirectionSelect(BRUSH_TYPES.TRIANGLE_TL)}
          title="좌측상단방향 삼각형"
        >
          🔺 좌상
        </button>
        <button
          className={`triangle-btn ${currentBrushType === BRUSH_TYPES.TRIANGLE_TR ? 'active' : ''}`}
          onClick={() => handleTriangleDirectionSelect(BRUSH_TYPES.TRIANGLE_TR)}
          title="우측상단방향 삼각형"
        >
          🔺 우상
        </button>
        <button
          className={`triangle-btn ${currentBrushType === BRUSH_TYPES.TRIANGLE_BL ? 'active' : ''}`}
          onClick={() => handleTriangleDirectionSelect(BRUSH_TYPES.TRIANGLE_BL)}
          title="좌측하단방향 삼각형"
        >
          🔺 좌하
        </button>
        <button
          className={`triangle-btn ${currentBrushType === BRUSH_TYPES.TRIANGLE_BR ? 'active' : ''}`}
          onClick={() => handleTriangleDirectionSelect(BRUSH_TYPES.TRIANGLE_BR)}
          title="우측하단방향 삼각형"
        >
          🔺 우하
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