import React, { useState } from 'react';
import './App.css';
import './index.css';
import Layout from './components/UI/Layout';
import IslandCanvas from './components/Canvas/IslandCanvas';
import ToolPanel from './components/Tools/ToolPanel';
import ObjectPalette from './components/Tools/ObjectPalette';
import ImageUpload from './components/Upload/ImageUpload';
import ImageCropper from './components/Upload/ImageCropper';
import PixelArtGenerator from './components/Design/PixelArtGenerator';
import PixelArtEditor from './components/Design/PixelArtEditor';
import { useCanvas } from './hooks/useCanvas';
import { TOOLS } from './constants/objectTypes';
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
    zoomLevel,
    setZoomLevel,
    step,
    setStep,
    uploadedImage,
    setUploadedImage,
    stageRef
  } = useCanvas();

  const [selectedObjectType, setSelectedObjectType] = useState(null);
  const [currentMode, setCurrentMode] = useState('island'); // 'island' or 'design'
  const [pixelArtUrl, setPixelArtUrl] = useState(null);

  const handleCanvasClick = (gridX, gridY, pixelX, pixelY) => {
    if (!isValidGridPosition(gridX, gridY)) return;

    switch (currentTool) {
      case TOOLS.OBJECT:
        if (selectedObjectType) {
          // 같은 위치에 오브젝트가 있는지 확인
          const existingObject = objects.find(obj => 
            obj.gridX === gridX && obj.gridY === gridY
          );
          
          if (!existingObject) {
            addObject({
              type: selectedObjectType.type,
              gridX,
              gridY,
              color: selectedObjectType.color
            });
          }
        }
        break;
      
      case TOOLS.ERASE:
        const objectToRemove = objects.find(obj => 
          obj.gridX === gridX && obj.gridY === gridY
        );
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
          🏝️ 모동숲 도구
        </h1>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button
            onClick={() => setCurrentMode('island')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentMode === 'island' ? '#4CAF50' : '#f0f0f0',
              color: currentMode === 'island' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🏝️ 섬 꾸미기
          </button>
          <button
            onClick={() => setCurrentMode('design')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentMode === 'design' ? '#4CAF50' : '#f0f0f0',
              color: currentMode === 'design' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🎨 마이디자인
          </button>
        </div>
        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          {currentMode === 'island' ? '7×6 격자에서 섬을 디자인하세요' : '32×32 격자에서 마이디자인을 만드세요'}
        </p>
      </div>

      {currentMode === 'island' && step === 'upload' && (
        <ImageUpload onImageUpload={handleImageUpload} />
      )}
      
      {currentMode === 'design' && (
        <PixelArtGenerator onPixelArtGenerated={setPixelArtUrl} />
      )}
      
      {currentMode === 'island' && step === 'edit' && backgroundImage && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '8px',
          marginBottom: '10px'
        }}>
          <h3>✅ 배경 지도 설정 완료</h3>
          <p style={{ fontSize: '12px', margin: 0 }}>
            112×96 격자에 맞춰 지도가 설정되었습니다.
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
      
      {currentMode === 'island' && step === 'edit' && (
        <ToolPanel 
          currentTool={currentTool} 
          onToolChange={setCurrentTool} 
        />
      )}
      
      {currentMode === 'island' && step === 'edit' && currentTool === TOOLS.OBJECT && (
        <ObjectPalette onObjectSelect={handleObjectSelect} />
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
        {currentMode === 'island' && step === 'upload' && (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>1단계: 섬 지도 이미지를 업로드하세요</li>
            <li>2단계: 7×6 격자에 맞춰 영역을 선택하세요</li>
            <li>3단계: 112×96 격자에서 섬을 꾸미세요</li>
          </ul>
        )}
        {currentMode === 'island' && step === 'edit' && (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>도구를 선택하고 격자를 클릭하세요</li>
            <li>오브젝트 도구로 건물과 장식을 배치하세요</li>
            <li>지우개로 오브젝트를 제거하세요</li>
            <li>마우스 휠로 줌 인/아웃 가능</li>
          </ul>
        )}
        {currentMode === 'design' && (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>이미지를 업로드하면 AI가 도트 아트로 변환</li>
            <li>32×32 격자에서 픽셀 단위로 편집</li>
            <li>동물의 숲 색상 팔레트 사용</li>
            <li>완성된 디자인을 PNG로 내보내기</li>
          </ul>
        )}
      </div>
    </>
  );

  return (
    <>
      <Layout sidebar={sidebar}>
        {currentMode === 'island' && step === 'upload' && (
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
        
        {currentMode === 'island' && step === 'edit' && (
          <IslandCanvas
            backgroundImage={backgroundImage}
            objects={objects}
            onCanvasClick={handleCanvasClick}
            stageRef={stageRef}
            currentTool={currentTool}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
          />
        )}
        
        {currentMode === 'design' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '20px'
          }}>
            <PixelArtEditor pixelArtUrl={pixelArtUrl} />
          </div>
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