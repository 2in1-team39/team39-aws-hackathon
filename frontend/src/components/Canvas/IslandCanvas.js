import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line, Image as KonvaImage } from 'react-konva';
import { GRID_CONFIG, COLORS } from '../../constants/gridConfig';
import { pixelToGrid } from '../../utils/gridUtils';

const IslandCanvas = ({ 
  backgroundImage, 
  objects, 
  onCanvasClick, 
  stageRef,
  currentTool,
  zoomLevel,
  setZoomLevel
}) => {
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    const updateCanvasSize = () => {
      const sidebar = 300;
      const padding = 40;
      const width = window.innerWidth - sidebar - padding;
      const height = window.innerHeight - padding;
      setCanvasSize({ width, height });
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);
  
  // 이미지 크기에 맞춰 스케일 계산
  const imageWidth = backgroundImage ? backgroundImage.width : 800;
  const imageHeight = backgroundImage ? backgroundImage.height : 600;
  
  const gridDisplayWidth = canvasSize.width * 0.9;
  const gridDisplayHeight = canvasSize.height * 0.9;
  
  const scaleX = gridDisplayWidth / imageWidth;
  const scaleY = gridDisplayHeight / imageHeight;
  const baseScale = Math.min(scaleX, scaleY);
  const finalScale = baseScale * zoomLevel;
  const drawGrid = () => {
    if (!backgroundImage) return [];
    
    const lines = [];
    const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
    
    // 메인 격자 (7x6 구역)
    for (let i = 0; i <= 7; i++) {
      lines.push(
        <Line
          key={`main-v-${i}`}
          points={[i * 16 * cellSize, 0, i * 16 * cellSize, backgroundImage.height]}
          stroke={COLORS.GRID_LINE}
          strokeWidth={2}
          opacity={1}
        />
      );
    }
    
    for (let i = 0; i <= 6; i++) {
      lines.push(
        <Line
          key={`main-h-${i}`}
          points={[0, i * 16 * cellSize, backgroundImage.width, i * 16 * cellSize]}
          stroke={COLORS.GRID_LINE}
          strokeWidth={2}
          opacity={1}
        />
      );
    }
    
    // 서브 격자 (16x16 칸)
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 6; row++) {
        const startX = col * 16 * cellSize;
        const startY = row * 16 * cellSize;
        
        for (let i = 1; i < 16; i++) {
          lines.push(
            <Line
              key={`sub-v-${col}-${row}-${i}`}
              points={[startX + i * cellSize, startY, startX + i * cellSize, startY + 16 * cellSize]}
              stroke={COLORS.SUB_GRID_LINE}
              strokeWidth={0.5}
              opacity={1}
            />
          );
        }
        
        for (let i = 1; i < 16; i++) {
          lines.push(
            <Line
              key={`sub-h-${col}-${row}-${i}`}
              points={[startX, startY + i * cellSize, startX + 16 * cellSize, startY + i * cellSize]}
              stroke={COLORS.SUB_GRID_LINE}
              strokeWidth={0.5}
              opacity={1}
            />
          );
        }
      }
    }
    
    return lines;
  };

  const handleStageClick = (e) => {
    if (!backgroundImage) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const adjustedX = pos.x / finalScale;
    const adjustedY = pos.y / finalScale;
    
    const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
    
    const gridX = Math.floor(adjustedX / cellSize);
    const gridY = Math.floor(adjustedY / cellSize);
    
    if (gridX >= 0 && gridX < GRID_CONFIG.COLS && gridY >= 0 && gridY < GRID_CONFIG.ROWS) {
      onCanvasClick(gridX, gridY, adjustedX, adjustedY);
    }
  };
  
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = zoomLevel;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setZoomLevel(Math.max(0.1, Math.min(5, newScale)));
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f0f0f0'
    }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '14px',
        zIndex: 1000
      }}>
        줌: {Math.round(zoomLevel * 100)}%
      </div>
      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        ref={stageRef}
        onClick={handleStageClick}
        onWheel={handleWheel}
        scaleX={finalScale}
        scaleY={finalScale}
        x={(canvasSize.width - imageWidth * finalScale) / 2}
        y={(canvasSize.height - imageHeight * finalScale) / 2}
        pixelRatio={window.devicePixelRatio || 1}
      >
        {/* 배경 레이어 */}
        <Layer>
          <Rect
            width={GRID_CONFIG.CANVAS_WIDTH}
            height={GRID_CONFIG.CANVAS_HEIGHT}
            fill={COLORS.BACKGROUND}
          />
          {backgroundImage && (
            <KonvaImage
              image={backgroundImage}
              x={0}
              y={0}
              imageSmoothingEnabled={false}
            />
          )}
        </Layer>
        
        {/* 오브젝트 레이어 */}
        <Layer>
          {backgroundImage && objects.map(obj => {
            const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
            return (
              <Rect
                key={obj.id}
                x={obj.gridX * cellSize}
                y={obj.gridY * cellSize}
                width={cellSize}
                height={cellSize}
                fill={obj.color || '#4CAF50'}
                stroke="#333"
                strokeWidth={1}
                opacity={0.8}
              />
            );
          })}
        </Layer>
        
        {/* 격자 레이어 */}
        <Layer>
          {drawGrid()}
        </Layer>
      </Stage>
    </div>
  );
};

export default IslandCanvas;