import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line, Image as KonvaImage, Group, Path } from 'react-konva';
import { GRID_CONFIG, COLORS } from '../../constants/gridConfig';
import { TOOLS, BRUSH_TYPES } from '../../constants/objectTypes';
import {
  createTrianglePath,
  erasePaintArea
} from '../../utils/trianglePainting';
import { happyBrush, paintWithHappyBrush } from '../../utils/happyIslandBrush';

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
  onToolChange,
  paintData,
  setPaintData,
  selectedColor,
  brushSize,
  eraserSize,
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
  removeObject,
  currentBrushType = BRUSH_TYPES.SQUARE,
  isEyedropperActive = false
}) => {
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [lastTouchCenter, setLastTouchCenter] = useState(null);
  const [touchStartPos, setTouchStartPos] = useState(null);
  const [touchStartTime, setTouchStartTime] = useState(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [touchStartStagePos, setTouchStartStagePos] = useState(null);
  
  
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
  }, [setIsSpacePressed, setIsShiftPressed, setLastPaintPos]);
  
  // 이미지 크기에 맞춰 스케일 계산
  // const imageWidth = backgroundImage ? backgroundImage.width : 800;
  // const imageHeight = backgroundImage ? backgroundImage.height : 600;

  // const gridDisplayWidth = canvasSize.width * 0.9;
  // const gridDisplayHeight = canvasSize.height * 0.9;
  

  const drawGrid = () => {
    if (!backgroundImage) return [];
    
    const lines = [];
    const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
    const offsetX = (canvasSize.width - backgroundImage.width * zoomLevel) / 2 + stagePos.x;
    const offsetY = (canvasSize.height - backgroundImage.height * zoomLevel) / 2 + stagePos.y;
    
    // 메인 격자 (7x6 구역)
    for (let i = 0; i <= 7; i++) {
      lines.push(
        <Line
          key={`main-v-${i}`}
          points={[offsetX + i * 16 * cellSize * zoomLevel, offsetY, offsetX + i * 16 * cellSize * zoomLevel, offsetY + backgroundImage.height * zoomLevel]}
          stroke={COLORS.GRID_LINE}
          strokeWidth={0.5 * zoomLevel}
          opacity={0.3}
        />
      );
    }
    
    for (let i = 0; i <= 6; i++) {
      lines.push(
        <Line
          key={`main-h-${i}`}
          points={[offsetX, offsetY + i * 16 * cellSize * zoomLevel, offsetX + backgroundImage.width * zoomLevel, offsetY + i * 16 * cellSize * zoomLevel]}
          stroke={COLORS.GRID_LINE}
          strokeWidth={0.5 * zoomLevel}
          opacity={0.3}
        />
      );
    }
    
    // 서브 격자 (16x16 칸)
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 6; row++) {
        const startX = offsetX + col * 16 * cellSize * zoomLevel;
        const startY = offsetY + row * 16 * cellSize * zoomLevel;
        
        for (let i = 1; i < 16; i++) {
          lines.push(
            <Line
              key={`sub-v-${col}-${row}-${i}`}
              points={[startX + i * cellSize * zoomLevel, startY, startX + i * cellSize * zoomLevel, startY + 16 * cellSize * zoomLevel]}
              stroke={COLORS.SUB_GRID_LINE}
              strokeWidth={0.2 * zoomLevel}
              opacity={0.2}
            />
          );
        }
        
        for (let i = 1; i < 16; i++) {
          lines.push(
            <Line
              key={`sub-h-${col}-${row}-${i}`}
              points={[startX, startY + i * cellSize * zoomLevel, startX + 16 * cellSize * zoomLevel, startY + i * cellSize * zoomLevel]}
              stroke={COLORS.SUB_GRID_LINE}
              strokeWidth={0.2 * zoomLevel}
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
    
    // 이미지 시작 위치 계산
    const imageStartX = (canvasSize.width - backgroundImage.width * zoomLevel) / 2 + stagePos.x;
    const imageStartY = (canvasSize.height - backgroundImage.height * zoomLevel) / 2 + stagePos.y;
    
    // 이미지 내에서의 좌표
    const imageX = pos.x - imageStartX;
    const imageY = pos.y - imageStartY;
    
    // 이미지 범위 체크
    if (imageX < 0 || imageY < 0 || imageX > backgroundImage.width * zoomLevel || imageY > backgroundImage.height * zoomLevel) {
      return;
    }
    
    const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
    
    const gridX = Math.floor(imageX / (cellSize * zoomLevel));
    const gridY = Math.floor(imageY / (cellSize * zoomLevel));
    
    if (gridX >= 0 && gridX < GRID_CONFIG.COLS && gridY >= 0 && gridY < GRID_CONFIG.ROWS) {
      const isRightClick = e.evt.button === 2;
      onCanvasClick(gridX, gridY, imageX, imageY, isRightClick);
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
    
    // 현재 이미지 위치
    const currentImageX = (canvasSize.width - backgroundImage.width * oldScale) / 2 + stagePos.x;
    const currentImageY = (canvasSize.height - backgroundImage.height * oldScale) / 2 + stagePos.y;
    
    // 마우스가 이미지 내에서 가리키는 비율 좌표
    const mouseRatioX = (pointer.x - currentImageX) / (backgroundImage.width * oldScale);
    const mouseRatioY = (pointer.y - currentImageY) / (backgroundImage.height * oldScale);
    
    // 새로운 이미지 크기에서 마우스가 가리킬 위치
    const newMouseX = mouseRatioX * backgroundImage.width * clampedScale;
    const newMouseY = mouseRatioY * backgroundImage.height * clampedScale;
    
    // 마우스 위치가 고정되도록 이미지 위치 조정
    const newImageX = pointer.x - newMouseX;
    const newImageY = pointer.y - newMouseY;
    
    // 기본 중앙 위치에서의 오프셋 계산
    const centerX = (canvasSize.width - backgroundImage.width * clampedScale) / 2;
    const centerY = (canvasSize.height - backgroundImage.height * clampedScale) / 2;
    
    setStagePos({
      x: newImageX - centerX,
      y: newImageY - centerY
    });
    setZoomLevel(clampedScale);
  };

  const getTouchDistance = (touches) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e) => {
    const touchCount = e.evt.touches.length;

    console.log('handleTouchStart called:', { touchCount, currentTool });

    if (touchCount === 1) {
      // 한 손가락 터치: 드래그 시작
      const touch = e.evt.touches[0];
      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      setTouchStartTime(Date.now());
      setTouchStartStagePos({ ...stagePos });
      setIsTouchDragging(false);
      setIsDragging(true); // 드래그 시작을 마크

      console.log('Touch start - setting isDragging to true');

      const isPaintTool = currentTool === TOOLS.PAINT || currentTool === TOOLS.ERASER;
      if (isPaintTool) {
        // 페인트 도구는 첫 터치에서도 페인팅
        console.log('Touch start - paint tool, resetting lastPaintPos');
        setLastPaintPos(null); // 새로운 터치 시작 시 이전 위치 초기화
        handleStageClick(e);
      }
    } else if (touchCount === 2) {
      // 두 손가락 터치: 줌/팬 준비
      const distance = getTouchDistance(e.evt.touches);
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      setLastTouchDistance(distance);
      setLastTouchCenter({ x: centerX, y: centerY });
      setTouchStartPos(null);
    }
  };

  const handleTouchMove = (e) => {
    const touchCount = e.evt.touches.length;
    const isPaintTool = currentTool === TOOLS.PAINT || currentTool === TOOLS.ERASER;

    console.log('handleTouchMove called:', { touchCount, isPaintTool, currentTool, isDragging });

    if (touchCount === 1) {
      if (isPaintTool && isDragging && backgroundImage) {
        // 페인트 도구일 때는 브라우저 기본 동작 방지 및 계속 페인팅
        e.evt.preventDefault();

        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();

        const imageStartX = (canvasSize.width - backgroundImage.width * zoomLevel) / 2 + stagePos.x;
        const imageStartY = (canvasSize.height - backgroundImage.height * zoomLevel) / 2 + stagePos.y;

        const imageX = pos.x - imageStartX;
        const imageY = pos.y - imageStartY;

        const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
        const gridX = Math.floor(imageX / (cellSize * zoomLevel));
        const gridY = Math.floor(imageY / (cellSize * zoomLevel));

        console.log('Touch move - Paint tool check:', {
          isPaintTool,
          isDragging,
          backgroundImage: !!backgroundImage,
          gridX,
          gridY,
          currentTool,
          lastPaintPos
        });

        if (gridX >= 0 && gridX < GRID_CONFIG.COLS && gridY >= 0 && gridY < GRID_CONFIG.ROWS) {
          // 같은 위치면 스킵 (중복 페인팅 방지)
          if (!lastPaintPos || lastPaintPos.x !== gridX || lastPaintPos.y !== gridY) {
            console.log('Calling paintCells from touch move:', { gridX, gridY, lastPaintPos });
            paintCells(gridX, gridY, imageX, imageY);
            setLastPaintPos({ x: gridX, y: gridY });
          } else {
            console.log('Skipping same position:', { gridX, gridY, lastPaintPos });
          }
        }
      } else {
        console.log('Touch move - NOT painting:', { isPaintTool, isDragging, backgroundImage: !!backgroundImage, currentTool });
      }

      if (!isPaintTool && touchStartPos) {
        // 페인트 도구가 아닐 때만 한 손가락 드래그 처리
        const touch = e.evt.touches[0];
        const deltaX = touch.clientX - touchStartPos.x;
        const deltaY = touch.clientY - touchStartPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > 10 && !isTouchDragging) {
          setIsTouchDragging(true);
        }

        if (isTouchDragging) {
          e.evt.preventDefault();
          setStagePos({
            x: touchStartStagePos.x + deltaX,
            y: touchStartStagePos.y + deltaY
          });
        }
      }
    } else if (touchCount === 2 && lastTouchDistance && lastTouchCenter) {
      // 두 손가락 드래그: 줌 + 팬
      e.evt.preventDefault();
      const currentDistance = getTouchDistance(e.evt.touches);
      const scale = currentDistance / lastTouchDistance;

      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];
      const currentCenterX = (touch1.clientX + touch2.clientX) / 2;
      const currentCenterY = (touch1.clientY + touch2.clientY) / 2;

      // 중심점 이동량 계산 (팬)
      const panDeltaX = currentCenterX - lastTouchCenter.x;
      const panDeltaY = currentCenterY - lastTouchCenter.y;

      const oldScale = zoomLevel;
      const newScale = Math.max(0.1, Math.min(5, oldScale * scale));

      // 팬 먼저 적용
      let newStageX = stagePos.x + panDeltaX;
      let newStageY = stagePos.y + panDeltaY;

      // 줌이 변경된 경우 중심점 기준으로 줌 적용
      if (Math.abs(scale - 1) > 0.01) {
        const currentImageX = (canvasSize.width - backgroundImage.width * oldScale) / 2 + newStageX;
        const currentImageY = (canvasSize.height - backgroundImage.height * oldScale) / 2 + newStageY;

        const touchRatioX = (currentCenterX - currentImageX) / (backgroundImage.width * oldScale);
        const touchRatioY = (currentCenterY - currentImageY) / (backgroundImage.height * oldScale);

        const newTouchX = touchRatioX * backgroundImage.width * newScale;
        const newTouchY = touchRatioY * backgroundImage.height * newScale;

        const newImageX = currentCenterX - newTouchX;
        const newImageY = currentCenterY - newTouchY;

        const newCenterX = (canvasSize.width - backgroundImage.width * newScale) / 2;
        const newCenterY = (canvasSize.height - backgroundImage.height * newScale) / 2;

        newStageX = newImageX - newCenterX;
        newStageY = newImageY - newCenterY;
      }

      setStagePos({ x: newStageX, y: newStageY });
      setZoomLevel(newScale);
      setLastTouchDistance(currentDistance);
      setLastTouchCenter({ x: currentCenterX, y: currentCenterY });
    }
  };

  const handleTouchEnd = (e) => {
    const isPaintTool = currentTool === TOOLS.PAINT || currentTool === TOOLS.ERASER;

    // 페인트 도구는 touchStart에서 이미 처리됨
    if (!isPaintTool && touchStartPos && touchStartTime && !isTouchDragging) {
      const touchDuration = Date.now() - touchStartTime;

      if (touchDuration > 500) {
        // 길게 누르기: 지우개 모드
        handleStageClick({
          ...e,
          evt: {
            ...e.evt,
            button: 2 // 우클릭으로 처리
          }
        });
      } else {
        // 짧은 탭: 일반 클릭
        handleStageClick(e);
      }
    }

    // 상태 초기화
    setTouchStartPos(null);
    setTouchStartTime(null);
    setIsTouchDragging(false);
    setTouchStartStagePos(null);
    setIsDragging(false);
    setLastPaintPos(null);
    if (e.evt.touches.length < 2) {
      setLastTouchDistance(null);
      setLastTouchCenter(null);
    }
  };
  
  const paintCells = (gridX, gridY, imageX, imageY) => {
    if (!backgroundImage) return;

    console.log('paintCells called:', { gridX, gridY, lastPaintPos, currentTool, selectedColor });

    let newPaintData = { ...paintData };
    let cellsToPaint = [];

    // 이전 위치가 있으면 항상 보간하여 연속성 보장
    if (lastPaintPos) {
      console.log('Using last paint position for interpolation:', lastPaintPos);
      // Bresenham's line algorithm으로 이전 위치와 현재 위치 사이 보간
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
      console.log('First paint point, no interpolation');
      // 첫 번째 점
      cellsToPaint.push({ x: gridX, y: gridY });
    }

    console.log('Cells to paint:', cellsToPaint);

    // HappyIslandDesigner 방식으로 브러시 크기를 고려한 페인팅
    // 모든 셀 페인팅 (연속성을 위해)
    cellsToPaint.forEach(({ x, y }) => {
      if (x >= 0 && x < GRID_CONFIG.COLS && y >= 0 && y < GRID_CONFIG.ROWS) {
        if (currentTool === TOOLS.PAINT && selectedColor) {
          // 마우스 위치에 따른 삼각형 방향 업데이트 (셀 좌표 기준)
          happyBrush.updateDirection({ x: x + (imageX % 1), y: y + (imageY % 1) });
          newPaintData = paintWithHappyBrush(newPaintData, x, y, selectedColor.color, GRID_CONFIG.COLS, GRID_CONFIG.ROWS);
        } else if (currentTool === TOOLS.ERASER) {
          newPaintData = erasePaintArea(newPaintData, x, y, eraserSize, GRID_CONFIG.COLS, GRID_CONFIG.ROWS);

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
    
    // 오른쪽 버튼 상태 관리 - 지우개 모드
    if (e.evt.button === 2) {
      setIsRightPressed(true);
      setIsDragging(true);
      
      // 지우개 도구로 전환
      onToolChange(TOOLS.ERASER);
      
      // 지우개 커서
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
      setLastPaintPos(null); // 새로운 페인팅 시작 시 이전 위치 초기화
      console.log('Mouse down - Paint tool, resetting lastPaintPos');

      if (backgroundImage) {
        // 이미지 시작 위치 계산
        const imageStartX = (canvasSize.width - backgroundImage.width * zoomLevel) / 2 + stagePos.x;
        const imageStartY = (canvasSize.height - backgroundImage.height * zoomLevel) / 2 + stagePos.y;

        // 이미지 내에서의 좌표
        const imageX = pos.x - imageStartX;
        const imageY = pos.y - imageStartY;

        const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
        const gridX = Math.floor(imageX / (cellSize * zoomLevel));
        const gridY = Math.floor(imageY / (cellSize * zoomLevel));

        if (gridX >= 0 && gridX < GRID_CONFIG.COLS && gridY >= 0 && gridY < GRID_CONFIG.ROWS) {
          console.log('Mouse down - Calling paintCells:', { gridX, gridY });
          paintCells(gridX, gridY, imageX, imageY);
          if (!isShiftPressed) {
            setLastPaintPos({ x: gridX, y: gridY });
          }
        }
      }
    }
  };
  
  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    console.log('handleMouseMove called:', { isDragging, currentTool, isSpacePressed });

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
      if (backgroundImage) {
        // 이미지 시작 위치 계산
        const imageStartX = (canvasSize.width - backgroundImage.width * zoomLevel) / 2 + stagePos.x;
        const imageStartY = (canvasSize.height - backgroundImage.height * zoomLevel) / 2 + stagePos.y;
        
        // 이미지 내에서의 좌표
        const imageX = pos.x - imageStartX;
        const imageY = pos.y - imageStartY;
        
        const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
        const gridX = Math.floor(imageX / (cellSize * zoomLevel));
        const gridY = Math.floor(imageY / (cellSize * zoomLevel));
        
        if (gridX >= 0 && gridX < GRID_CONFIG.COLS && gridY >= 0 && gridY < GRID_CONFIG.ROWS) {
          // 브러시 크기만큼 지우기
          const newPaintData = { ...paintData };
          let hasChanges = false;
          
          const offset = Math.floor(1 / 2);
          for (let dx = 0; dx < 1; dx++) {
            for (let dy = 0; dy < 1; dy++) {
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
    
    // 실시간 페인팅 (마우스와 터치 모두 지원)
    if (isDragging && (currentTool === TOOLS.PAINT || currentTool === TOOLS.ERASER) && !isSpacePressed && currentTool !== TOOLS.OBJECT) {
      console.log('Mouse move - Paint tool painting');
      if (backgroundImage) {
        // 이미지 시작 위치 계산
        const imageStartX = (canvasSize.width - backgroundImage.width * zoomLevel) / 2 + stagePos.x;
        const imageStartY = (canvasSize.height - backgroundImage.height * zoomLevel) / 2 + stagePos.y;

        // 이미지 내에서의 좌표
        const imageX = pos.x - imageStartX;
        const imageY = pos.y - imageStartY;

        const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
        const gridX = Math.floor(imageX / (cellSize * zoomLevel));
        const gridY = Math.floor(imageY / (cellSize * zoomLevel));

        if (gridX >= 0 && gridX < GRID_CONFIG.COLS && gridY >= 0 && gridY < GRID_CONFIG.ROWS) {
          // 같은 위치면 스킵 (중복 페인팅 방지)
          if (!lastPaintPos || lastPaintPos.x !== gridX || lastPaintPos.y !== gridY) {
            console.log('Mouse move - Calling paintCells:', { gridX, gridY, lastPaintPos });
            // 자유 그리기: 이전 위치와 현재 위치 사이 보간하여 연속성 보장
            paintCells(gridX, gridY, imageX, imageY);
            setLastPaintPos({ x: gridX, y: gridY });
          }
        }
      }
    }

  };
  
  const handleMouseUp = (e) => {
    // const stage = e.target.getStage();

    setIsDragging(false);
    setLastPointerPos(null);

    // 오른쪽 버튼 해제 시 원래 도구로 복귀
    if (isRightPressed && e.evt.button === 2) {
      onToolChange(TOOLS.PAINT); // 기본적으로 페인트로 복귀
    }
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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable={false}
          pixelRatio={window.devicePixelRatio || 1}
        >
        {/* 배경 레이어 */}
        <Layer>
          {backgroundImage && (
            <KonvaImage
              image={backgroundImage}
              x={(canvasSize.width - backgroundImage.width * zoomLevel) / 2 + stagePos.x}
              y={(canvasSize.height - backgroundImage.height * zoomLevel) / 2 + stagePos.y}
              width={backgroundImage.width * zoomLevel}
              height={backgroundImage.height * zoomLevel}
              imageSmoothingEnabled={false}
            />
          )}
        </Layer>
        
        {/* 페인트 레이어 */}
        <Layer>
          {backgroundImage && Object.entries(paintData).map(([key, paintInfo]) => {
            const [x, y] = key.split(',').map(Number);
            const cellSize = Math.min(backgroundImage.width / GRID_CONFIG.COLS, backgroundImage.height / GRID_CONFIG.ROWS);
            const baseX = (canvasSize.width - backgroundImage.width * zoomLevel) / 2 + stagePos.x + x * cellSize * zoomLevel;
            const baseY = (canvasSize.height - backgroundImage.height * zoomLevel) / 2 + stagePos.y + y * cellSize * zoomLevel;

            // 기존 사각형 페인팅 (호환성)
            if (typeof paintInfo === 'string') {
              return (
                <Rect
                  key={key}
                  x={baseX}
                  y={baseY}
                  width={cellSize * zoomLevel}
                  height={cellSize * zoomLevel}
                  fill={paintInfo}
                  opacity={1}
                />
              );
            }

            // 새로운 구조 - 사각형
            if (paintInfo.type === 'square') {
              return (
                <Rect
                  key={key}
                  x={baseX}
                  y={baseY}
                  width={cellSize * zoomLevel}
                  height={cellSize * zoomLevel}
                  fill={paintInfo.color}
                  opacity={1}
                />
              );
            }


            // 새로운 구조 - 삼각형들
            if (paintInfo.type === 'triangles') {
              return Object.entries(paintInfo.triangles).map(([triangleType, color]) => (
                <Path
                  key={`${key}-${triangleType}`}
                  x={baseX}
                  y={baseY}
                  data={createTrianglePath(triangleType, cellSize * zoomLevel)}
                  fill={color}
                  opacity={1}
                />
              ));
            }

            return null;
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
                x={(canvasSize.width - backgroundImage.width * zoomLevel) / 2 + stagePos.x + obj.gridX * cellSize * zoomLevel}
                y={(canvasSize.height - backgroundImage.height * zoomLevel) / 2 + stagePos.y + obj.gridY * cellSize * zoomLevel}
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
                  width={cellSize * objSize * zoomLevel}
                  height={cellSize * objSize * zoomLevel}
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