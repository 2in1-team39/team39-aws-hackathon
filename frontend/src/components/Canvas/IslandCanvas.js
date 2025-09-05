import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line, Image as KonvaImage, Group } from 'react-konva';
import { GRID_CONFIG, COLORS } from '../../constants/gridConfig';
import { TOOLS } from '../../constants/objectTypes';
import { pixelToGrid } from '../../utils/gridUtils';

const ObjectImage = ({ x, y, width, height, imageSrc }) => {
  const [image, setImage] = useState(null);
  
  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = imageSrc;
    }
  }, [imageSrc]);
  
  if (!image) {
    return (
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#4CAF50"
        stroke="#333"
        strokeWidth={1}
        opacity={0.8}
      />
    );
  }
  
  return (
    <KonvaImage
      x={x}
      y={y}
      width={width}
      height={height}
      image={image}
    />
  );
};

const IslandCanvas = ({ 
  backgroundImage, 
  objects, 
  onCanvasClick, 
  stageRef,
  currentTool,
  paintData,
  setPaintData,
  selectedColor,
  brushSize,
  isDragging,
  setIsDragging,
  stagePos,
  setStagePos,
  isSpacePressed,
  setIsSpacePressed,
  isShiftPressed,
  setIsShiftPressed,
  lastPaintPos,
  setLastPaintPos,
  lastPointerPos,
  setLastPointerPos,
  isRightPressed,
  setIsRightPressed,
  draggedObject,
  setDraggedObject,
  selectedObjectType,
  zoomLevel,
  setZoomLevel,
  removeObject
}) => {
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  const updateCursor = () => {
    if (!stageRef.current) return;
    const stage = stageRef.current;
    
    if (currentTool === TOOLS.PAINT) {
      const size = brushSize * 12;
      const color = selectedColor ? selectedColor.color.replace('#', '%23') : '%23000000';
      stage.container().style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Crect width='${size}' height='${size}' fill='${color}' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E") ${size/2} ${size/2}, crosshair`;
    } else {
      stage.container().style.cursor = 'default';
    }
  };
  
  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setCanvasSize({ width, height });
    };
    
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setIsShiftPressed(true);
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setIsShiftPressed(false);
        setLastPaintPos(null);
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
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
          strokeWidth={0.5}
          opacity={0.3}
        />
      );
    }
    
    for (let i = 0; i <= 6; i++) {
      lines.push(
        <Line
          key={`main-h-${i}`}
          points={[0, i * 16 * cellSize, backgroundImage.width, i * 16 * cellSize]}
          stroke={COLORS.GRID_LINE}
          strokeWidth={0.5}
          opacity={0.3}
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
              strokeWidth={0.2}
              opacity={0.2}
            />
          );
        }
        
        for (let i = 1; i < 16; i++) {
          lines.push(
            <Line
              key={`sub-h-${col}-${row}-${i}`}
              points={[startX, startY + i * cellSize, startX + 16 * cellSize, startY + i * cellSize]}
              stroke={COLORS.SUB_GRID_LINE}
              strokeWidth={0.2}
              opacity={0.2}
            />
          );
        }
      }
    }
    
    return lines;
  };

  const handleStageClick = (e) => {
    if (!backgroundImage || isDragging || isSpacePressed) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const adjustedX = (pos.x - stagePos.x) / zoomLevel;
    const adjustedY = (pos.y - stagePos.y) / zoomLevel;
    
    const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
    
    const gridX = Math.floor(adjustedX / cellSize);
    const gridY = Math.floor(adjustedY / cellSize);
    
    if (gridX >= 0 && gridX < GRID_CONFIG.COLS && gridY >= 0 && gridY < GRID_CONFIG.ROWS) {
      const isRightClick = e.evt.button === 2;
      onCanvasClick(gridX, gridY, adjustedX, adjustedY, isRightClick);
    }
  };
  
  const handleContextMenu = (e) => {
    e.evt.preventDefault(); // 오른쪽 클릭 메뉴 방지
  };
  
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const oldScale = zoomLevel;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    
    // 마우스 위치 기준 확대
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale
    };
    
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale
    };
    
    setStagePos(newPos);
    setZoomLevel(clampedScale);
  };
  
  const paintCells = (gridX, gridY, isLine = false) => {
    if (!backgroundImage) return;
    
    const newPaintData = { ...paintData };
    let cellsToPaint = [];
    
    if (isLine && lastPaintPos) {
      // 직선 그리기
      const dx = Math.abs(gridX - lastPaintPos.x);
      const dy = Math.abs(gridY - lastPaintPos.y);
      const sx = lastPaintPos.x < gridX ? 1 : -1;
      const sy = lastPaintPos.y < gridY ? 1 : -1;
      let err = dx - dy;
      
      let x = lastPaintPos.x;
      let y = lastPaintPos.y;
      
      while (true) {
        cellsToPaint.push({ x, y });
        if (x === gridX && y === gridY) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x += sx; }
        if (e2 < dx) { err += dx; y += sy; }
      }
    } else {
      cellsToPaint.push({ x: gridX, y: gridY });
    }
    
    cellsToPaint.forEach(({ x: centerX, y: centerY }) => {
      const offset = Math.floor(brushSize / 2);
      for (let dx = 0; dx < brushSize; dx++) {
        for (let dy = 0; dy < brushSize; dy++) {
          const x = centerX - offset + dx;
          const y = centerY - offset + dy;
          
          if (x >= 0 && x < GRID_CONFIG.COLS && y >= 0 && y < GRID_CONFIG.ROWS) {
            const key = `${x},${y}`;
            if (currentTool === TOOLS.PAINT && selectedColor) {
              newPaintData[key] = selectedColor.color;
            } else if (currentTool === TOOLS.ERASER) {
              delete newPaintData[key];
              // 오브젝트도 삭제
              const objectToRemove = objects.find(obj => {
                const objSize = obj.size || 1;
                return x >= obj.gridX && x < obj.gridX + objSize &&
                       y >= obj.gridY && y < obj.gridY + objSize;
              });
              if (objectToRemove) {
                removeObject(objectToRemove.id);
              }
            }
          }
        }
      }
    });
    
    setPaintData(newPaintData);
  };
  
  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    // 오브젝트 도구일 때는 페인트 비활성화
    if (currentTool === TOOLS.OBJECT) {
      return;
    }
    
    // 오른쪽 버튼 상태 관리
    if (e.evt.button === 2) {
      setIsRightPressed(true);
      setIsDragging(true);
      stage.container().style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23ff6b6b\' d=\'M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l8.48-8.48c.79-.78 2.05-.78 2.84 0l2.11 2.12zm-1.41 1.41L12.7 7.1 16.9 11.3l2.12-2.12-4.19-4.21z\'/%3E%3Cpath fill=\'%23ffa8a8\' d=\'M12.7 7.1L8.51 11.3 12.7 15.5 16.9 11.3 12.7 7.1z\'/%3E%3C/svg%3E") 12 12, auto';
      return;
    }
    
    if (isSpacePressed) {
      setIsDragging(true);
      setLastPointerPos(pos);
      stage.container().style.cursor = 'grabbing';
      return;
    }
    
    if (currentTool === TOOLS.PAINT || currentTool === TOOLS.ERASER) {
      setIsDragging(true);
      const adjustedX = (pos.x - stagePos.x) / zoomLevel;
      const adjustedY = (pos.y - stagePos.y) / zoomLevel;
      
      if (backgroundImage) {
        const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
        const gridX = Math.floor(adjustedX / cellSize);
        const gridY = Math.floor(adjustedY / cellSize);
        
        paintCells(gridX, gridY, isShiftPressed && lastPaintPos);
        if (!isShiftPressed) {
          setLastPaintPos({ x: gridX, y: gridY });
        }
      }
    }
  };
  
  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    if (isDragging && isSpacePressed && lastPointerPos) {
      const dx = pos.x - lastPointerPos.x;
      const dy = pos.y - lastPointerPos.y;
      setStagePos(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
    }
    
    if (isDragging && isSpacePressed) {
      setLastPointerPos(pos);
    }
    
    // 오른쪽 버튼 드래그 시 지우기
    if (isDragging && isRightPressed) {
      const adjustedX = (pos.x - stagePos.x) / zoomLevel;
      const adjustedY = (pos.y - stagePos.y) / zoomLevel;
      
      if (backgroundImage) {
        const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
        const gridX = Math.floor(adjustedX / cellSize);
        const gridY = Math.floor(adjustedY / cellSize);
        
        if (gridX >= 0 && gridX < GRID_CONFIG.COLS && gridY >= 0 && gridY < GRID_CONFIG.ROWS) {
          // 브러시 크기만큼 지우기
          const newPaintData = { ...paintData };
          let hasChanges = false;
          
          const offset = Math.floor(brushSize / 2);
          for (let dx = 0; dx < brushSize; dx++) {
            for (let dy = 0; dy < brushSize; dy++) {
              const eraseX = gridX - offset + dx;
              const eraseY = gridY - offset + dy;
              
              if (eraseX >= 0 && eraseX < GRID_CONFIG.COLS && eraseY >= 0 && eraseY < GRID_CONFIG.ROWS) {
                // 오브젝트 삭제
                const objectToRemove = objects.find(obj => {
                  const objSize = obj.size || 1;
                  return eraseX >= obj.gridX && eraseX < obj.gridX + objSize &&
                         eraseY >= obj.gridY && eraseY < obj.gridY + objSize;
                });
                if (objectToRemove) {
                  removeObject(objectToRemove.id);
                }
                
                // 페인트 삭제
                const key = `${eraseX},${eraseY}`;
                if (newPaintData[key]) {
                  delete newPaintData[key];
                  hasChanges = true;
                }
              }
            }
          }
          
          if (hasChanges) {
            setPaintData(newPaintData);
          }
        }
      }
      return;
    }
    
    if (isDragging && (currentTool === TOOLS.PAINT || currentTool === TOOLS.ERASER) && !isSpacePressed && currentTool !== TOOLS.OBJECT) {
      const adjustedX = (pos.x - stagePos.x) / zoomLevel;
      const adjustedY = (pos.y - stagePos.y) / zoomLevel;
      
      if (backgroundImage) {
        const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
        const gridX = Math.floor(adjustedX / cellSize);
        const gridY = Math.floor(adjustedY / cellSize);
        
        // 이전 위치와 현재 위치 사이의 모든 점을 칠하기
        if (lastPaintPos) {
          paintCells(gridX, gridY, true); // 직선 그리기 사용
        } else {
          paintCells(gridX, gridY, false);
        }
        setLastPaintPos({ x: gridX, y: gridY });
      }
    }
    

  };
  
  const handleMouseUp = (e) => {
    const stage = e.target.getStage();
    setIsDragging(false);
    setLastPointerPos(null);
    setIsRightPressed(false);
    

    
    if (!isShiftPressed) {
      setLastPaintPos(null);
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#7AD8C6'
    }}>
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '14px',
        zIndex: 1000
      }}>
        줌: {Math.round(zoomLevel * 100)}%
      </div>
      {backgroundImage && (
        <Stage
          width={canvasSize.width}
          height={canvasSize.height}
          ref={stageRef}
          onClick={handleStageClick}
          onContextMenu={handleContextMenu}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          scaleX={zoomLevel}
          scaleY={zoomLevel}
          x={stagePos.x}
          y={stagePos.y}
          pixelRatio={window.devicePixelRatio || 1}
        >
        {/* 배경 레이어 */}
        <Layer>
          {backgroundImage && (
            <KonvaImage
              image={backgroundImage}
              x={(canvasSize.width - backgroundImage.width * zoomLevel) / 2 / zoomLevel}
              y={(canvasSize.height - backgroundImage.height * zoomLevel) / 2 / zoomLevel}
              imageSmoothingEnabled={false}
            />
          )}
        </Layer>
        
        {/* 페인트 레이어 */}
        <Layer>
          {backgroundImage && Object.entries(paintData).map(([key, color]) => {
            const [x, y] = key.split(',').map(Number);
            const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
            return (
              <Rect
                key={key}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill={color}
                opacity={1}
              />
            );
          })}
        </Layer>
        
        {/* 오브젝트 레이어 */}
        <Layer>
          {backgroundImage && objects.map(obj => {
            const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
            const objSize = obj.size || 1;
            return (
              <Group
                key={obj.id}
                x={obj.gridX * cellSize}
                y={obj.gridY * cellSize}
                draggable={true}
                onDragStart={() => setDraggedObject(obj)}
                onDragEnd={(e) => {
                  const newX = Math.round(e.target.x() / cellSize);
                  const newY = Math.round(e.target.y() / cellSize);
                  
                  // 범위 및 충돌 검사
                  if (newX >= 0 && newX + objSize <= GRID_CONFIG.COLS && 
                      newY >= 0 && newY + objSize <= GRID_CONFIG.ROWS) {
                    
                    const hasCollision = objects.some(other => 
                      other.id !== obj.id &&
                      newX < other.gridX + (other.size || 1) &&
                      newX + objSize > other.gridX &&
                      newY < other.gridY + (other.size || 1) &&
                      newY + objSize > other.gridY
                    );
                    
                    if (!hasCollision) {
                      // 오브젝트 위치 업데이트 (임시 방법)
                      obj.gridX = newX;
                      obj.gridY = newY;
                    } else {
                      // 충돌 시 원래 위치로 복귀
                      e.target.x(obj.gridX * cellSize);
                      e.target.y(obj.gridY * cellSize);
                    }
                  } else {
                    // 범위 밖으로 나갔을 때 원래 위치로 복귀
                    e.target.x(obj.gridX * cellSize);
                    e.target.y(obj.gridY * cellSize);
                  }
                  
                  setDraggedObject(null);
                }}
              >
                <ObjectImage
                  x={0}
                  y={0}
                  width={cellSize * objSize}
                  height={cellSize * objSize}
                  imageSrc={obj.image}
                />
              </Group>
            );
          })}
        </Layer>
        
        {/* 격자 레이어 */}
        <Layer>
          {drawGrid()}
        </Layer>
        </Stage>
      )}
    </div>
  );
};

export default IslandCanvas;