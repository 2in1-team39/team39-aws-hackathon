import React, { useState } from 'react';
import CompactToolPanel from '../Tools/CompactToolPanel';
import ObjectPanel from '../Tools/ObjectPanel';
import ChecklistPanel from '../Tools/ChecklistPanel';

const FloatingToolbar = ({
  step,
  currentTool,
  onToolChange,
  selectedColor,
  onColorSelect,
  brushSize,
  setBrushSize,
  currentBrushType,
  setCurrentBrushType,
  isEyedropperActive,
  onEyedropperToggle,
  selectedObjectType,
  onObjectSelect,
  onImageUpload,
  backgroundImage,
  setBackgroundImage,
  setUploadedImage,
  setStep,
  onSaveProject,
  onClearCanvas,
  onClearSavedData
}) => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isObjectsOpen, setIsObjectsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  // 디바이스 감지 (터치 디바이스인지 확인)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isTablet = isTouchDevice && (window.innerWidth >= 768 && window.innerWidth <= 1024);

  // 반응형 스타일
  const getButtonSize = () => {
    if (isTablet) return { width: '60px', height: '60px', borderRadius: '30px' };
    return { width: '50px', height: '50px', borderRadius: '25px' };
  };

  const getToolbarSpacing = () => {
    if (isTablet) return { top: '30px', left: '30px', gap: '15px' };
    return { top: '20px', left: '20px', gap: '10px' };
  };

  const getFontSize = () => {
    if (isTablet) return '24px';
    return '20px';
  };

  const buttonSize = getButtonSize();
  const toolbarSpacing = getToolbarSpacing();
  const fontSize = getFontSize();

  // 공통 버튼 스타일
  const getButtonStyle = (isActive = false, backgroundColor = 'white', activeColor = '#4CAF50') => ({
    width: buttonSize.width,
    height: buttonSize.height,
    borderRadius: buttonSize.borderRadius,
    border: 'none',
    backgroundColor: isActive ? activeColor : backgroundColor,
    color: isActive ? 'white' : (backgroundColor === 'white' ? '#333' : 'white'),
    fontSize: fontSize,
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent' // 모바일에서 탭 하이라이트 제거
  });

  return (
    <>
      {/* 메인 툴바 */}
      <div style={{
        position: 'fixed',
        top: toolbarSpacing.top,
        left: toolbarSpacing.left,
        display: 'flex',
        gap: toolbarSpacing.gap,
        zIndex: 1000,
        flexWrap: isTablet ? 'wrap' : 'nowrap',
        maxWidth: isTablet ? '200px' : 'none'
      }}>
        {/* 페인트 버튼 */}
        {step === 'edit' && (
          <button
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            style={getButtonStyle(isToolsOpen, 'white', '#4CAF50')}
          >
            🎨
          </button>
        )}
        
        {/* 지우개 버튼 */}
        {step === 'edit' && (
          <button
            onClick={() => onToolChange('eraser')}
            style={getButtonStyle(currentTool === 'eraser', 'white', '#f44336')}
            title="지우개"
          >
            🧽
          </button>
        )}

        {/* 오브젝트 버튼 */}
        {step === 'edit' && (
          <button
            onClick={() => setIsObjectsOpen(!isObjectsOpen)}
            style={getButtonStyle(isObjectsOpen, 'white', '#FF9800')}
          >
            🏠
          </button>
        )}



        {/* 체크리스트 버튼 */}
        {step === 'edit' && (
          <button
            onClick={() => setIsChecklistOpen(!isChecklistOpen)}
            style={getButtonStyle(isChecklistOpen, 'white', '#9C27B0')}
          >
            ✅
          </button>
        )}

        {/* 저장 버튼 */}
        {step === 'edit' && (
          <button
            onClick={onSaveProject}
            style={getButtonStyle(false, 'white')}
          >
            💾
          </button>
        )}

        {/* 초기화 버튼 */}
        {step === 'edit' && (
          <button
            onClick={onClearCanvas}
            style={getButtonStyle(false, 'white')}
          >
            🗑️
          </button>
        )}

        {/* 저장된 데이터 삭제 버튼 */}
        {step === 'edit' && (
          <button
            onClick={onClearSavedData}
            style={getButtonStyle(false, '#dc3545')}
            title="저장된 모든 데이터 삭제"
          >
            💣
          </button>
        )}

        {/* 도움말 버튼 */}
        <button
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          style={getButtonStyle(isHelpOpen, 'white', '#2196F3')}
        >
          ❓
        </button>
      </div>

      {/* 도구 패널 */}
      {isToolsOpen && step === 'edit' && (
        <div style={{
          position: 'fixed',
          top: isTablet ? '120px' : '80px',
          left: isTablet ? '30px' : '20px',
          backgroundColor: 'white',
          borderRadius: isTablet ? '15px' : '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 999,
          minWidth: isTablet ? '300px' : '250px',
          maxWidth: isTablet ? '90vw' : 'none'
        }}>
          <CompactToolPanel
            currentTool={currentTool}
            onToolChange={onToolChange}
            selectedColor={selectedColor}
            onColorSelect={onColorSelect}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            currentBrushType={currentBrushType}
            setCurrentBrushType={setCurrentBrushType}
            isEyedropperActive={isEyedropperActive}
            onEyedropperToggle={onEyedropperToggle}
            selectedObjectType={selectedObjectType}
            onObjectSelect={onObjectSelect}
          />
        </div>
      )}
      
      {/* 오브젝트 패널 */}
      {isObjectsOpen && step === 'edit' && (
        <div style={{
          position: 'fixed',
          top: isTablet ? '120px' : '80px',
          left: isTablet ? '30px' : '80px',
          backgroundColor: 'white',
          borderRadius: isTablet ? '15px' : '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 999,
          minWidth: isTablet ? '300px' : '250px',
          maxWidth: isTablet ? '90vw' : 'none'
        }}>
          <ObjectPanel
            currentTool={currentTool}
            onToolChange={onToolChange}
            selectedObjectType={selectedObjectType}
            onObjectSelect={onObjectSelect}
          />
        </div>
      )}

      {/* 체크리스트 패널 */}
      {isChecklistOpen && step === 'edit' && (
        <div style={{
          position: 'fixed',
          top: isTablet ? '120px' : '80px',
          left: isTablet ? '30px' : '140px',
          zIndex: 999
        }}>
          <ChecklistPanel />
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
            style={getButtonStyle(false, 'white')}
          >
            🔄
          </button>
        </div>
      )}

      {/* 도움말 패널 */}
      {isHelpOpen && (
        <div style={{
          position: 'fixed',
          bottom: isTablet ? '30px' : '20px',
          left: isTablet ? '30px' : '20px',
          backgroundColor: 'white',
          borderRadius: isTablet ? '15px' : '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 999,
          padding: isTablet ? '20px' : '15px',
          maxWidth: isTablet ? '90vw' : '300px',
          fontSize: isTablet ? '16px' : '14px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: isTablet ? '18px' : '14px' }}>사용법</h4>
          {step === 'upload' && (
            <ul style={{ margin: 0, paddingLeft: isTablet ? '30px' : '20px', fontSize: isTablet ? '16px' : '12px', lineHeight: isTablet ? '1.6' : '1.4' }}>
              <li>1단계: 섬 지도 이미지를 업로드하세요</li>
              <li>2단계: 7×6 격자에 맞춰 영역을 선택하세요</li>
              <li>3단계: 112×96 격자에서 섬을 꾸미세요</li>
            </ul>
          )}
          {step === 'edit' && (
            <ul style={{ margin: 0, paddingLeft: isTablet ? '30px' : '20px', fontSize: isTablet ? '16px' : '12px', lineHeight: isTablet ? '1.6' : '1.4' }}>
              <li>🎨 버튼으로 도구를 선택하세요</li>
              <li>🧽 지우개 버튼으로 지우개 도구 선택</li>
              <li>격자를 탭하여 페인트/오브젝트 배치</li>
              {isTablet ? (
                <>
                  <li>길게 누르기로 삭제</li>
                  <li>한 손가락 드래그로 지도 이동</li>
                  <li>두 손가락 핀치로 줌 인/아웃</li>
                </>
              ) : (
                <>
                  <li>오른쪽 클릭으로 삭제</li>
                  <li>스페이스바 + 드래그로 지도 이동</li>
                  <li>마우스 휠로 줌 인/아웃</li>
                </>
              )}
              <li>💾 작업 내용이 자동 저장됩니다</li>
              <li>💣 빨간 버튼으로 저장 데이터 삭제</li>
            </ul>
          )}
        </div>
      )}

      {/* 배경 클릭 시 패널 닫기 */}
      {(isHelpOpen || isChecklistOpen) && (
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
            setIsChecklistOpen(false);
          }}
        />
      )}
    </>
  );
};

export default FloatingToolbar;