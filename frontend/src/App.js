import React, { useState } from 'react';
import './App.css';
import './index.css';
import IslandCanvas from './components/Canvas/IslandCanvas';
import FloatingToolbar from './components/UI/FloatingToolbar';
import ImageUpload from './components/Upload/ImageUpload';
import ImageCropper from './components/Upload/ImageCropper';
import { useCanvas } from './hooks/useCanvas';
import { TOOLS, PAINT_COLORS } from './constants/objectTypes';
import { GRID_CONFIG } from './constants/gridConfig';
import { isValidGridPosition } from './utils/gridUtils';

function App() {
  const {
    currentTool = TOOLS.PAINT,
    setCurrentTool,
    backgroundImage,
    setBackgroundImage,
    objects,
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

  const handleCanvasClick = (gridX, gridY, pixelX, pixelY, isRightClick = false) => {
    console.log('Canvas click - Current tool:', currentTool, 'Selected object:', selectedObjectType);
    if (!isValidGridPosition(gridX, gridY)) return;

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
  
  // 도구 변경 시 커서 업데이트
  React.useEffect(() => {
    if (stageRef.current) {
      const stage = stageRef.current;
      
      if (isSpacePressed) {
        stage.container().style.cursor = 'grab';
      } else if (isRightPressed) {
        stage.container().style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23ff6b6b\' d=\'M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l8.48-8.48c.79-.78 2.05-.78 2.84 0l2.11 2.12zm-1.41 1.41L12.7 7.1 16.9 11.3l2.12-2.12-4.19-4.21z\'/%3E%3Cpath fill=\'%23ffa8a8\' d=\'M12.7 7.1L8.51 11.3 12.7 15.5 16.9 11.3 12.7 7.1z\'/%3E%3C/svg%3E") 12 12, auto';
      } else {
        switch (currentTool) {
          case TOOLS.PAINT:
            let size = brushSize * 8;
            if (backgroundImage) {
              const cellSize = Math.min(backgroundImage.width / 112, backgroundImage.height / 96);
              size = Math.max(8, Math.min(64, brushSize * cellSize * zoomLevel));
            }
            const color = selectedColor ? selectedColor.color.replace('#', '%23') : '%23000000';
            stage.container().style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Crect width='${size}' height='${size}' fill='${color}' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E") ${size/2} ${size/2}, crosshair`;
            break;
          case TOOLS.ERASER:
            stage.container().style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23ff6b6b\' d=\'M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l8.48-8.48c.79-.78 2.05-.78 2.84 0l2.11 2.12zm-1.41 1.41L12.7 7.1 16.9 11.3l2.12-2.12-4.19-4.21z\'/%3E%3Cpath fill=\'%23ffa8a8\' d=\'M12.7 7.1L8.51 11.3 12.7 15.5 16.9 11.3 12.7 7.1z\'/%3E%3C/svg%3E") 12 12, auto';
            break;
          case TOOLS.OBJECT:
            stage.container().style.cursor = 'pointer';
            break;
          default:
            // 기본은 페인트 도구
            let defaultSize = brushSize * 8;
            if (backgroundImage) {
              const cellSize = Math.min(backgroundImage.width / 112, backgroundImage.height / 96);
              defaultSize = Math.max(8, Math.min(64, brushSize * cellSize * zoomLevel));
            }
            const defaultColor = selectedColor ? selectedColor.color.replace('#', '%23') : '%23000000';
            stage.container().style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${defaultSize}' height='${defaultSize}' viewBox='0 0 ${defaultSize} ${defaultSize}'%3E%3Crect width='${defaultSize}' height='${defaultSize}' fill='${defaultColor}' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E") ${defaultSize/2} ${defaultSize/2}, crosshair`;
        }
      }
    }
  }, [currentTool, brushSize, selectedColor, isSpacePressed, isRightPressed, zoomLevel, backgroundImage]);

  const handleSaveProject = () => {
    const projectData = {
      objects,
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
        setBrushSize={setBrushSize}
        currentBrushType={currentBrushType}
        setCurrentBrushType={setCurrentBrushType}
        selectedObjectType={selectedObjectType}
        onObjectSelect={handleObjectSelect}
        onImageUpload={handleImageUpload}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
        setUploadedImage={setUploadedImage}
        setStep={setStep}
        onSaveProject={handleSaveProject}
        onClearCanvas={clearCanvas}
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