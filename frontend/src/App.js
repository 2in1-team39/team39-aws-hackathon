import React, { useState } from 'react';
import './App.css';
import './index.css';
import IslandCanvas from './components/Canvas/IslandCanvas';
import FloatingToolbar from './components/UI/FloatingToolbar';
import ImageUpload from './components/Upload/ImageUpload';
import ImageCropper from './components/Upload/ImageCropper';
import { useCanvas } from './hooks/useCanvas';
import { TOOLS, PAINT_COLORS, BRUSH_TYPES } from './constants/objectTypes';
import { GRID_CONFIG } from './constants/gridConfig';
import { isValidGridPosition } from './utils/gridUtils';

function App() {
  const {
    currentTool = TOOLS.PAINT,
    setCurrentTool,
    backgroundImage,
    setBackgroundImage,
    objects,
    setObjects,
    addObject,
    removeObject,
    clearCanvas,
    paintData,
    setPaintData,
    selectedColor = PAINT_COLORS.WATER,
    setSelectedColor,
    brushSize,
    setBrushSize,
    currentBrushType,
    setCurrentBrushType,
    isLineMode,
    setIsLineMode,
    isEyedropperActive,
    setIsEyedropperActive,
    lineStartPos,
    setLineStartPos,
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
    zoomLevel,
    setZoomLevel,
    step,
    setStep,
    uploadedImage,
    setUploadedImage,
    stageRef
  } = useCanvas();

  const [selectedObjectType, setSelectedObjectType] = useState(null);
  const [brushUpdateTrigger, setBrushUpdateTrigger] = useState(0);

  // 앱 시작 시 저장된 데이터 로드
  React.useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // 자동 저장: 주요 상태가 변경될 때마다 저장
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage();
    }, 1000); // 1초 후 저장 (디바운싱)

    return () => clearTimeout(timeoutId);
  }, [objects, paintData, backgroundImage, selectedColor, brushSize, currentBrushType, currentTool, zoomLevel, stagePos, step]);

  // 브러시 크기 변경 시 커서 업데이트 트리거
  const handleBrushSizeChange = (size) => {
    setBrushSize(size);
    setBrushUpdateTrigger(prev => prev + 1);
  };

  // 브러시 타입 변경 시 커서 업데이트 트리거
  const handleBrushTypeChange = (type) => {
    setCurrentBrushType(type);
    setBrushUpdateTrigger(prev => prev + 1);
  };

  // 스포이드 기능을 위한 색상 추출 함수
  const extractColorFromCanvas = (x, y) => {
    if (!stageRef.current || !backgroundImage) return null;

    const stage = stageRef.current;
    const canvas = stage.toCanvas();
    const ctx = canvas.getContext('2d');

    // 픽셀 데이터 가져오기
    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b] = imageData.data;

    // RGB를 hex로 변환
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    return hex;
  };

  // 스포이드 토글 함수
  const handleEyedropperToggle = () => {
    setIsEyedropperActive(!isEyedropperActive);
  };

  // 직선 모드 토글 함수
  const handleLineModeToggle = (isLine) => {
    setIsLineMode(isLine);
    setLineStartPos(null); // 직선 시작점 초기화
  };

  const handleCanvasClick = (gridX, gridY, pixelX, pixelY, isRightClick = false) => {
    console.log('Canvas click - Current tool:', currentTool, 'Selected object:', selectedObjectType);
    if (!isValidGridPosition(gridX, gridY)) return;

    // 스포이드 모드일 때 색상 추출
    if (isEyedropperActive && !isRightClick) {
      const extractedColor = extractColorFromCanvas(pixelX, pixelY);
      if (extractedColor) {
        const customColorObj = {
          id: 'custom',
          name: '추출된 색상',
          color: extractedColor
        };
        setSelectedColor(customColorObj);
        setIsEyedropperActive(false); // 스포이드 모드 종료
      }
      return;
    }

    // 오른쪽 클릭 시 삭제 기능
    if (isRightClick) {
      // 오브젝트 삭제
      const objectToRemove = objects.find(obj => {
        const objSize = obj.size || 1;
        return gridX >= obj.gridX && gridX < obj.gridX + objSize &&
               gridY >= obj.gridY && gridY < obj.gridY + objSize;
      });
      if (objectToRemove) {
        removeObject(objectToRemove.id);
        return;
      }
      
      // 페인트 삭제
      const newPaintData = { ...paintData };
      const key = `${gridX},${gridY}`;
      if (newPaintData[key]) {
        delete newPaintData[key];
        setPaintData(newPaintData);
      }
      return;
    }

    // 오브젝트 도구일 때만 오브젝트 배치 처리
    if (currentTool === TOOLS.OBJECT) {
      console.log('Object tool clicked:', { selectedObjectType, gridX, gridY });
      if (selectedObjectType) {
        const isTree = selectedObjectType.type === 'tree' || selectedObjectType.type === 'fruit_tree' || selectedObjectType.type === 'palm_tree';
        const size = isTree ? 3 : 1;
        
        console.log('Object details:', { type: selectedObjectType.type, size, isTree });
        
        // 배치 가능한 영역인지 확인
        if (gridX + size > GRID_CONFIG.COLS || gridY + size > GRID_CONFIG.ROWS) {
          console.log('Out of bounds');
          return; // 영역을 벗어남
        }
        
        // 충돌 검사
        let hasCollision = false;
        for (let dx = 0; dx < size; dx++) {
          for (let dy = 0; dy < size; dy++) {
            const checkX = gridX + dx;
            const checkY = gridY + dy;
            const existingObject = objects.find(obj => {
              const objSize = obj.size || 1;
              return checkX >= obj.gridX && checkX < obj.gridX + objSize &&
                     checkY >= obj.gridY && checkY < obj.gridY + objSize;
            });
            if (existingObject) {
              hasCollision = true;
              break;
            }
          }
          if (hasCollision) break;
        }
        
        if (!hasCollision) {
          console.log('Adding object:', {
            type: selectedObjectType.type,
            gridX,
            gridY,
            image: selectedObjectType.image,
            name: selectedObjectType.name,
            size
          });
          addObject({
            type: selectedObjectType.type,
            gridX,
            gridY,
            image: selectedObjectType.image,
            name: selectedObjectType.name,
            size
          });
        } else {
          console.log('Collision detected');
        }
      } else {
        console.log('No object type selected');
      }
      return; // 오브젝트 배치 후 리턴
    }
    
    // 다른 도구들 처리
    switch (currentTool) {
      case TOOLS.ERASER:
        const objectToRemove = objects.find(obj => {
          const objSize = obj.size || 1;
          return gridX >= obj.gridX && gridX < obj.gridX + objSize &&
                 gridY >= obj.gridY && gridY < obj.gridY + objSize;
        });
        if (objectToRemove) {
          removeObject(objectToRemove.id);
        }
        break;
      
      default:
        break;
    }
  };

  const handleImageUpload = (image) => {
    setUploadedImage(image);
    setStep('crop');
  };
  
  const handleCropComplete = (croppedImage) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scaleX = (width * 0.8) / croppedImage.width;
    const scaleY = (height * 0.8) / croppedImage.height;
    const scale = Math.min(scaleX, scaleY, 1);
    
    setZoomLevel(scale);
    setStagePos({ x: 0, y: 0 }); // CSS로 중앙 정렬
    setBackgroundImage(croppedImage);
    setStep('edit');
  };
  
  const handleCropCancel = () => {
    setUploadedImage(null);
    setStep('upload');
  };

  const handleObjectSelect = (objectType) => {
    setSelectedObjectType(objectType);
    setCurrentTool(TOOLS.OBJECT);
  };
  
  // HappyIslandDesigner 브러시 시스템에 맞춘 커서 생성 함수
  const generateBrushCursor = () => {
    if (!backgroundImage) return 'crosshair';

    // HappyIslandDesigner 브러시 시스템에서 실제 브러시 크기와 타입 가져오기
    const { happyBrush } = require('./utils/happyIslandBrush');
    const rawBrushSize = happyBrush.rawBrushSize;
    const brushType = happyBrush.brushType;

    const cellSize = Math.min(backgroundImage.width / 112, backgroundImage.height / 96) * zoomLevel;
    const color = selectedColor ? selectedColor.color.replace('#', '%23') : '%23000000';

    // 크기 0 (삼각형 브러시)
    if (rawBrushSize === 0) {
      const size = Math.max(8, cellSize);
      return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Cpath d='M${size/2},0 L${size},${size} L0,${size} Z' fill='${color}' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E") ${size/2} ${size/2}, crosshair`;
    }

    // 크기 1 (1x1 사각형)
    if (rawBrushSize === 1) {
      const size = Math.max(8, cellSize);
      return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Crect width='${size}' height='${size}' fill='${color}' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E") ${size/2} ${size/2}, crosshair`;
    }

    // 크기 2
    if (rawBrushSize === 2) {
      const size = Math.max(16, cellSize * 2);

      if (brushType === 'rounded') {
        // 다이아몬드 모양
        const half = size / 2;
        return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Cpath d='M${half},0 L${size},${half} L${half},${size} L0,${half} Z' fill='${color}' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E") ${half} ${half}, crosshair`;
      } else {
        // 2x2 사각형
        return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Crect width='${size}' height='${size}' fill='${color}' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E") ${size/2} ${size/2}, crosshair`;
      }
    }

    // 크기 3+
    if (rawBrushSize >= 3) {
      const size = Math.max(24, cellSize * rawBrushSize);

      if (brushType === 'rounded') {
        // 팔각형 모양 (간단화해서 원형으로 표시)
        return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Ccircle cx='${size/2}' cy='${size/2}' r='${size/2-1}' fill='${color}' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E") ${size/2} ${size/2}, crosshair`;
      } else {
        // 사각형
        return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Crect width='${size}' height='${size}' fill='${color}' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E") ${size/2} ${size/2}, crosshair`;
      }
    }

    // 기본값
    return 'crosshair';
  };

  // 도구 변경 시 커서 업데이트
  React.useEffect(() => {
    if (stageRef.current) {
      const stage = stageRef.current;

      if (isSpacePressed) {
        stage.container().style.cursor = 'grab';
      } else if (isRightPressed) {
        stage.container().style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23ff6b6b\' d=\'M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l8.48-8.48c.79-.78 2.05-.78 2.84 0l2.11 2.12zm-1.41 1.41L12.7 7.1 16.9 11.3l2.12-2.12-4.19-4.21z\'/%3E%3Cpath fill=\'%23ffa8a8\' d=\'M12.7 7.1L8.51 11.3 12.7 15.5 16.9 11.3 12.7 7.1z\'/%3E%3C/svg%3E") 12 12, auto';
      } else if (isEyedropperActive) {
        stage.container().style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23007bff\' d=\'M19.35 11.72l-9.5-9.5a1 1 0 0 0-1.41 0L7.39 3.27a1 1 0 0 0 0 1.41l1.45 1.45-5.66 5.66a1 1 0 0 0-.29.71v5a1 1 0 0 0 1 1h5a1 1 0 0 0 .71-.29l5.66-5.66 1.45 1.45a1 1 0 0 0 1.41 0l1.05-1.05a1 1 0 0 0 0-1.41zm-8.5-6.2l1.79 1.79-1.41 1.41L9.44 6.93l1.41-1.41zM8.5 14.5H5v-3.5L8.5 14.5z\'/%3E%3C/svg%3E") 12 12, auto';
      } else {
        switch (currentTool) {
          case TOOLS.PAINT:
            stage.container().style.cursor = generateBrushCursor();
            break;
          case TOOLS.ERASER:
            stage.container().style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23ff6b6b\' d=\'M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l8.48-8.48c.79-.78 2.05-.78 2.84 0l2.11 2.12zm-1.41 1.41L12.7 7.1 16.9 11.3l2.12-2.12-4.19-4.21z\'/%3E%3Cpath fill=\'%23ffa8a8\' d=\'M12.7 7.1L8.51 11.3 12.7 15.5 16.9 11.3 12.7 7.1z\'/%3E%3C/svg%3E") 12 12, auto';
            break;
          case TOOLS.OBJECT:
            stage.container().style.cursor = 'pointer';
            break;
          default:
            stage.container().style.cursor = generateBrushCursor();
        }
      }
    }
  }, [currentTool, brushSize, selectedColor, currentBrushType, isSpacePressed, isRightPressed, isEyedropperActive, zoomLevel, backgroundImage, brushUpdateTrigger]);

  // localStorage에 자동 저장
  const saveToLocalStorage = () => {
    try {
      const projectData = {
        objects,
        paintData,
        backgroundImage: backgroundImage ? backgroundImage.src : null,
        selectedColor,
        brushSize,
        currentBrushType,
        currentTool,
        zoomLevel,
        stagePos,
        step,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('island-designer-autosave', JSON.stringify(projectData));
      console.log('작업 내용이 자동 저장되었습니다.');
    } catch (error) {
      console.error('자동 저장 실패:', error);
    }
  };

  // localStorage에서 불러오기
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('island-designer-autosave');
      if (savedData) {
        const projectData = JSON.parse(savedData);

        // 상태 복원
        if (projectData.objects) setObjects(projectData.objects);
        if (projectData.paintData) setPaintData(projectData.paintData);
        if (projectData.selectedColor) setSelectedColor(projectData.selectedColor);
        if (projectData.brushSize) setBrushSize(projectData.brushSize);
        if (projectData.currentBrushType) setCurrentBrushType(projectData.currentBrushType);
        if (projectData.currentTool) setCurrentTool(projectData.currentTool);
        if (projectData.zoomLevel) setZoomLevel(projectData.zoomLevel);
        if (projectData.stagePos) setStagePos(projectData.stagePos);
        if (projectData.step) setStep(projectData.step);

        // 배경 이미지 복원
        if (projectData.backgroundImage) {
          const img = new Image();
          img.onload = () => {
            setBackgroundImage(img);
            setUploadedImage(img);
          };
          img.src = projectData.backgroundImage;
        }

        console.log('저장된 작업을 불러왔습니다:', projectData.timestamp);
        return true;
      }
    } catch (error) {
      console.error('불러오기 실패:', error);
    }
    return false;
  };

  // 저장된 데이터 삭제
  const clearSavedData = () => {
    if (window.confirm('저장된 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        localStorage.removeItem('island-designer-autosave');
        console.log('저장된 데이터가 삭제되었습니다.');
        // 페이지 새로고침으로 초기 상태로 돌아감
        window.location.reload();
      } catch (error) {
        console.error('데이터 삭제 실패:', error);
      }
    }
  };

  // 파일로 저장 (기존 기능)
  const handleSaveProject = () => {
    const projectData = {
      objects,
      paintData,
      backgroundImage: backgroundImage ? backgroundImage.src : null,
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(projectData);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'island-design.json';
    link.click();

    URL.revokeObjectURL(url);
  };



  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#7AD8C6' }}>
      <FloatingToolbar
        step={step}
        currentTool={currentTool}
        onToolChange={setCurrentTool}
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
        brushSize={brushSize}
        setBrushSize={handleBrushSizeChange}
        currentBrushType={currentBrushType}
        setCurrentBrushType={handleBrushTypeChange}
        isLineMode={isLineMode}
        onLineModeToggle={handleLineModeToggle}
        isEyedropperActive={isEyedropperActive}
        onEyedropperToggle={handleEyedropperToggle}
        selectedObjectType={selectedObjectType}
        onObjectSelect={handleObjectSelect}
        onImageUpload={handleImageUpload}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
        setUploadedImage={setUploadedImage}
        setStep={setStep}
        onSaveProject={handleSaveProject}
        onClearCanvas={clearCanvas}
        onClearSavedData={clearSavedData}
      />
      
      {step === 'upload' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            padding: '20px'
          }}>
            <ImageUpload onImageUpload={handleImageUpload} />
          </div>
        </div>
      )}
      
      {step === 'edit' && (
        <IslandCanvas
          backgroundImage={backgroundImage}
          objects={objects}
          onCanvasClick={handleCanvasClick}
          stageRef={stageRef}
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          paintData={paintData}
          setPaintData={setPaintData}
          selectedColor={selectedColor}
          brushSize={brushSize}
          currentBrushType={currentBrushType}
          isLineMode={isLineMode}
          isEyedropperActive={isEyedropperActive}
          lineStartPos={lineStartPos}
          setLineStartPos={setLineStartPos}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          stagePos={stagePos}
          setStagePos={setStagePos}
          isSpacePressed={isSpacePressed}
          setIsSpacePressed={setIsSpacePressed}
          isShiftPressed={isShiftPressed}
          setIsShiftPressed={setIsShiftPressed}
          lastPaintPos={lastPaintPos}
          setLastPaintPos={setLastPaintPos}
          lastPointerPos={lastPointerPos}
          setLastPointerPos={setLastPointerPos}
          isRightPressed={isRightPressed}
          setIsRightPressed={setIsRightPressed}
          draggedObject={draggedObject}
          setDraggedObject={setDraggedObject}
          selectedObjectType={selectedObjectType}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          removeObject={removeObject}
        />
      )}
      
      {step === 'crop' && uploadedImage && (
        <ImageCropper
          image={uploadedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default App;