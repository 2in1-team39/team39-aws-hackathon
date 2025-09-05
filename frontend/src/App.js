import React, { useState } from 'react';
import './App.css';
import './index.css';
import Layout from './components/UI/Layout';
import IslandCanvas from './components/Canvas/IslandCanvas';
import ToolPanel from './components/Tools/ToolPanel';
import ObjectPalette from './components/Tools/ObjectPalette';
import PaintPalette from './components/Tools/PaintPalette';
import EraserPalette from './components/Tools/EraserPalette';
import ImageUpload from './components/Upload/ImageUpload';
import ImageCropper from './components/Upload/ImageCropper';
import { useCanvas } from './hooks/useCanvas';
import { TOOLS, PAINT_COLORS } from './constants/objectTypes';
import { GRID_CONFIG } from './constants/gridConfig';
import { isValidGridPosition } from './utils/gridUtils';

function App() {
  const {
    currentTool,
    setCurrentTool,
    backgroundImage,
    setBackgroundImage,
    objects,
    addObject,
    removeObject,
    clearCanvas,
    paintData,
    setPaintData,
    selectedColor,
    setSelectedColor,
    brushSize,
    setBrushSize,
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

    switch (currentTool) {
      case TOOLS.OBJECT:
        if (selectedObjectType) {
          const isTree = selectedObjectType.type === 'tree';
          const size = isTree ? 3 : 1;
          
          // 배치 가능한 영역인지 확인
          if (gridX + size > GRID_CONFIG.COLS || gridY + size > GRID_CONFIG.ROWS) {
            return; // 영역을 벗어남
          }
          
          // 충돌 검사
          let hasCollision = false;
          for (let dx = 0; dx < size; dx++) {
            for (let dy = 0; dy < size; dy++) {
              const checkX = gridX + dx;
              const checkY = gridY + dy;
              const existingObject = objects.find(obj => {
                const objSize = obj.type === 'tree' ? 3 : 1;
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
            addObject({
              type: selectedObjectType.type,
              gridX,
              gridY,
              image: selectedObjectType.image,
              name: selectedObjectType.name,
              size
            });
          }
        }
        break;
      
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

  const sidebar = (
    <>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', margin: '0 0 10px 0' }}>
          🏝️ 모동숲 섬 꾸미기
        </h1>
      </div>

      {step === 'upload' && (
        <ImageUpload onImageUpload={handleImageUpload} />
      )}
      
      {step === 'edit' && backgroundImage && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '8px',
          marginBottom: '10px'
        }}>
          <p style={{ fontSize: '12px', margin: 0 }}>
            ✅ 배경 지도 설정 완료
          </p>
          <button
            onClick={() => {
              setBackgroundImage(null);
              setUploadedImage(null);
              setStep('upload');
            }}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            다른 이미지 선택
          </button>
        </div>
      )}
      
      {step === 'edit' && (
        <ToolPanel 
          currentTool={currentTool} 
          onToolChange={setCurrentTool} 
        />
      )}
      
      {step === 'edit' && currentTool === TOOLS.OBJECT && (
        <ObjectPalette onObjectSelect={handleObjectSelect} />
      )}
      
      {step === 'edit' && currentTool === TOOLS.PAINT && (
        <PaintPalette 
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
        />
      )}
      
      {step === 'edit' && currentTool === TOOLS.ERASER && (
        <EraserPalette 
          brushSize={brushSize}
          setBrushSize={setBrushSize}
        />
      )}

      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        marginBottom: '10px'
      }}>
        <h3>프로젝트</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleSaveProject}
            style={{
              padding: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            💾 저장하기
          </button>
          <button
            onClick={clearCanvas}
            style={{
              padding: '10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🗑️ 초기화
          </button>
        </div>
      </div>

      <div style={{ 
        padding: '10px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '8px',
        fontSize: '12px'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>사용법</h4>
        {step === 'upload' && (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>1단계: 섬 지도 이미지를 업로드하세요</li>
            <li>2단계: 7×6 격자에 맞춰 영역을 선택하세요</li>
            <li>3단계: 112×96 격자에서 섬을 꾸미세요</li>
          </ul>
        )}
        {step === 'edit' && (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>도구를 선택하고 격자를 클릭하세요</li>
            <li>오브젝트 도구로 건물과 장식을 배치하세요</li>
            <li>오른쪽 클릭으로 오브젝트/페인트 삭제</li>
            <li>마우스 휠로 줌 인/아웃 가능</li>
          </ul>
        )}
      </div>
    </>
  );

  return (
    <>
      <Layout sidebar={sidebar}>
        {step === 'upload' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: '18px',
            color: '#666'
          }}>
            좌측에서 섬 지도 이미지를 업로드하세요
          </div>
        )}
        
        {step === 'edit' && (
          <IslandCanvas
            backgroundImage={backgroundImage}
            objects={objects}
            onCanvasClick={handleCanvasClick}
            stageRef={stageRef}
            currentTool={currentTool}
            paintData={paintData}
            setPaintData={setPaintData}
            selectedColor={selectedColor}
            brushSize={brushSize}
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
      </Layout>
      
      {step === 'crop' && uploadedImage && (
        <ImageCropper
          image={uploadedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}

export default App;