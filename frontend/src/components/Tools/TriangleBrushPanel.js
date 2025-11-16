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
    // ROUNDED 타입일 때 크기 2로 설정
    if (type === BRUSH_TYPES.ROUNDED && happyBrush.rawBrushSize < 2) {
      happyBrush.rawBrushSize = 2;
      happyBrush.brushSize = 2;
    }
    onBrushTypeChange(type);
  };

  const handleTriangleDirectionSelect = (triangleType) => {
    // 삼각형 방향 선택 시 처리
    // 실제 브러시의 direction을 설정하기 위해 행동 시뮬레이션
    happyBrush.rawBrushSize = 1;
    happyBrush.brushSize = 1;
    happyBrush.brushType = BRUSH_TYPES.ROUNDED;

    // 삼각형 방향에 따라 방향 설정
    const directionMap = {
      [BRUSH_TYPES.TRIANGLE_TL]: { x: 0, y: 0 },
      [BRUSH_TYPES.TRIANGLE_TR]: { x: 1, y: 0 },
      [BRUSH_TYPES.TRIANGLE_BL]: { x: 0, y: 1 },
      [BRUSH_TYPES.TRIANGLE_BR]: { x: 1, y: 1 }
    };

    happyBrush.direction = directionMap[triangleType] || { x: 0, y: 0 };
    onBrushTypeChange(BRUSH_TYPES.ROUNDED);
  };

  const getBrushSizeDisplay = () => {
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

      <h4>브러시 크기</h4>
      <div className="brush-size-controls">
        <button className="size-btn" onClick={handleSizeDecrease}>-</button>
        <div className="size-display">{getBrushSizeDisplay()}</div>
        <button className="size-btn" onClick={handleSizeIncrease}>+</button>
      </div>
      <div className="size-info">
        크기 0 = 삼각형, 1+ = 일반 브러시
      </div>

      {currentBrushType === BRUSH_TYPES.ROUNDED && happyBrush.brushSize === 1 && (
        <>
          <h4>1x1 삼각형 방향</h4>
          <div className="triangle-direction-controls">
            <button
              className="triangle-btn"
              onClick={() => handleTriangleDirectionSelect(BRUSH_TYPES.TRIANGLE_TL)}
              title="좌측상단방향 삼각형"
            >
              🔺 좌상
            </button>
            <button
              className="triangle-btn"
              onClick={() => handleTriangleDirectionSelect(BRUSH_TYPES.TRIANGLE_TR)}
              title="우측상단방향 삼각형"
            >
              🔺 우상
            </button>
            <button
              className="triangle-btn"
              onClick={() => handleTriangleDirectionSelect(BRUSH_TYPES.TRIANGLE_BL)}
              title="좌측하단방향 삼각형"
            >
              🔺 좌하
            </button>
            <button
              className="triangle-btn"
              onClick={() => handleTriangleDirectionSelect(BRUSH_TYPES.TRIANGLE_BR)}
              title="우측하단방향 삼각형"
            >
              🔺 우하
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TriangleBrushPanel;