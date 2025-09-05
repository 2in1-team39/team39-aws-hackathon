import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';

const GRID_SIZE = 32;
const CELL_SIZE = 12;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

const ANIMAL_CROSSING_PALETTE = [
  '#FFFFFF', '#FFCCCC', '#FF9999', '#FF6666', '#FF3333', '#FF0000',
  '#CCFFCC', '#99FF99', '#66FF66', '#33FF33', '#00FF00', '#00CC00',
  '#CCCCFF', '#9999FF', '#6666FF', '#3333FF', '#0000FF', '#0000CC',
  '#FFFFCC', '#FFFF99', '#FFFF66', '#FFFF33', '#FFFF00', '#CCCC00',
  '#FFCCFF', '#FF99FF', '#FF66FF', '#FF33FF', '#FF00FF', '#CC00CC',
  '#CCFFFF', '#99FFFF', '#66FFFF', '#33FFFF', '#00FFFF', '#00CCCC',
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF'
];

const PixelArtEditor = ({ pixelArtUrl }) => {
  const [grid, setGrid] = useState(() => 
    Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('#FFFFFF'))
  );
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const stageRef = useRef();

  const handleCellClick = (row, col) => {
    const newGrid = [...grid];
    newGrid[row][col] = selectedColor;
    setGrid(newGrid);
  };

  const handleMouseDown = (row, col) => {
    setIsDrawing(true);
    handleCellClick(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (isDrawing) {
      handleCellClick(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const exportDesign = () => {
    const canvas = stageRef.current.toCanvas();
    const link = document.createElement('a');
    link.download = 'my-design.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div>
        <h3>32×32 마이디자인 에디터</h3>
        <Stage
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          ref={stageRef}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <Layer>
            {grid.map((row, rowIndex) =>
              row.map((color, colIndex) => (
                <Rect
                  key={`${rowIndex}-${colIndex}`}
                  x={colIndex * CELL_SIZE}
                  y={rowIndex * CELL_SIZE}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  fill={color}
                  stroke="#ddd"
                  strokeWidth={0.5}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                />
              ))
            )}
          </Layer>
        </Stage>
        
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={exportDesign}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            💾 디자인 내보내기
          </button>
        </div>
      </div>

      <div style={{ width: '200px' }}>
        <h4>색상 팔레트</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)', 
          gap: '2px',
          marginBottom: '20px'
        }}>
          {ANIMAL_CROSSING_PALETTE.map(color => (
            <div
              key={color}
              onClick={() => setSelectedColor(color)}
              style={{
                width: '25px',
                height: '25px',
                backgroundColor: color,
                border: selectedColor === color ? '3px solid #000' : '1px solid #ccc',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>

        {pixelArtUrl && (
          <div>
            <h4>AI 생성 참고 이미지</h4>
            <img 
              src={pixelArtUrl} 
              alt="AI Generated Pixel Art"
              style={{ width: '100%', imageRendering: 'pixelated' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PixelArtEditor;