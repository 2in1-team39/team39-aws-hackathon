import React, { useState } from 'react';
import CompactToolPanel from '../Tools/CompactToolPanel';
import ObjectPanel from '../Tools/ObjectPanel';
import ImageUpload from '../Upload/ImageUpload';

const FloatingToolbar = ({ 
  step,
  currentTool,
  onToolChange,
  selectedColor,
  onColorSelect,
  brushSize,
  setBrushSize,
  selectedObjectType,
  onObjectSelect,
  onImageUpload,
  backgroundImage,
  setBackgroundImage,
  setUploadedImage,
  setStep,
  onSaveProject,
  onClearCanvas
}) => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isObjectsOpen, setIsObjectsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      {/* 메인 툴바 */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        display: 'flex',
        gap: '10px',
        zIndex: 1000
      }}>
        {/* 페인트 버튼 */}
        {step === 'edit' && (
          <button
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '25px',
              border: 'none',
              backgroundColor: isToolsOpen ? '#4CAF50' : 'white',
              color: isToolsOpen ? 'white' : '#333',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            🎨
          </button>
        )}
        
        {/* 오브젝트 버튼 */}
        {step === 'edit' && (
          <button
            onClick={() => setIsObjectsOpen(!isObjectsOpen)}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '25px',
              border: 'none',
              backgroundColor: isObjectsOpen ? '#FF9800' : 'white',
              color: isObjectsOpen ? 'white' : '#333',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            🏠
          </button>
        )}



        {/* 저장 버튼 */}
        {step === 'edit' && (
          <button
            onClick={onSaveProject}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '25px',
              border: 'none',
              backgroundColor: 'white',
              color: '#333',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            💾
          </button>
        )}

        {/* 초기화 버튼 */}
        {step === 'edit' && (
          <button
            onClick={onClearCanvas}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '25px',
              border: 'none',
              backgroundColor: 'white',
              color: '#333',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            🗑️
          </button>
        )}

        {/* 도움말 버튼 */}
        <button
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '25px',
            border: 'none',
            backgroundColor: isHelpOpen ? '#2196F3' : 'white',
            color: isHelpOpen ? 'white' : '#333',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ❓
        </button>
      </div>

      {/* 도구 패널 */}
      {isToolsOpen && step === 'edit' && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '20px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 999,
          minWidth: '250px'
        }}>
          <CompactToolPanel
            currentTool={currentTool}
            onToolChange={onToolChange}
            selectedColor={selectedColor}
            onColorSelect={onColorSelect}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            selectedObjectType={selectedObjectType}
            onObjectSelect={onObjectSelect}
          />
        </div>
      )}
      
      {/* 오브젝트 패널 */}
      {isObjectsOpen && step === 'edit' && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '80px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 999,
          minWidth: '250px'
        }}>
          <ObjectPanel
            currentTool={currentTool}
            onToolChange={onToolChange}
            selectedObjectType={selectedObjectType}
            onObjectSelect={onObjectSelect}
          />
        </div>
      )}

      {/* 배경 변경 버튼 */}
      {step === 'edit' && backgroundImage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000
        }}>
          <button
            onClick={() => {
              setBackgroundImage(null);
              setUploadedImage(null);
              setStep('upload');
            }}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '25px',
              border: 'none',
              backgroundColor: 'white',
              color: '#333',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            🔄
          </button>
        </div>
      )}

      {/* 도움말 패널 */}
      {isHelpOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 999,
          padding: '15px',
          maxWidth: '300px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>사용법</h4>
          {step === 'upload' && (
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
              <li>1단계: 섬 지도 이미지를 업로드하세요</li>
              <li>2단계: 7×6 격자에 맞춰 영역을 선택하세요</li>
              <li>3단계: 112×96 격자에서 섬을 꾸미세요</li>
            </ul>
          )}
          {step === 'edit' && (
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
              <li>🎨 버튼으로 도구를 선택하세요</li>
              <li>격자를 클릭하여 페인트/오브젝트 배치</li>
              <li>오른쪽 클릭으로 삭제</li>
              <li>스페이스바 + 드래그로 지도 이동</li>
              <li>마우스 휠로 줌 인/아웃</li>
            </ul>
          )}
        </div>
      )}

      {/* 배경 클릭 시 패널 닫기 */}
      {isHelpOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998
          }}
          onClick={() => {
            setIsHelpOpen(false);
          }}
        />
      )}
    </>
  );
};

export default FloatingToolbar;