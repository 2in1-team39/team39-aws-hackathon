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
  eraserSize,
  setEraserSize,
  currentBrushType,
  setCurrentBrushType,
  selectedObjectType,
  onObjectSelect,
  onImageUpload,
  backgroundImage,
  setBackgroundImage,
  setUploadedImage,
  setStep,
  onSaveProject,
  onClearCanvas,
  onClearSavedData,
  isToolsOpen,
  setIsToolsOpen,
  isObjectsOpen,
  setIsObjectsOpen,
  isEraserOpen,
  setIsEraserOpen,
  isChecklistOpen,
  setIsChecklistOpen
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // 모든 도구 패널을 닫는 헬퍼 함수
  const closeAllToolPanels = () => {
    setIsToolsOpen(false);
    setIsObjectsOpen(false);
    setIsEraserOpen(false);
    setIsChecklistOpen(false);
  };

  // 디바이스 감지 (터치 디바이스인지 확인)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isTablet = isTouchDevice && (window.innerWidth >= 768 && window.innerWidth <= 1024);

  // 반응형 스타일
  const getButtonSize = () => {
    if (isTablet) return { width: '60px', height: '60px', borderRadius: '30px' };
    return { width: '50px', height: '50px', borderRadius: '25px' };
  };

  const getToolbarSpacing = () => {
    if (isTablet) return {
      top: '20px',
      left: '50%',
      gap: '15px',
      transform: 'translateX(-50%)', // 중앙 정렬
      flexDirection: 'row' // 가로 배열
    };
    return { top: '20px', left: '20px', gap: '10px', flexDirection: 'column' };
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
        transform: toolbarSpacing.transform || 'none',
        display: 'flex',
        flexDirection: toolbarSpacing.flexDirection || 'column',
        gap: toolbarSpacing.gap,
        zIndex: 1000,
        flexWrap: 'nowrap',
        backgroundColor: isTablet ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        borderRadius: isTablet ? '35px' : '0',
        padding: isTablet ? '10px 20px' : '0',
        boxShadow: isTablet ? '0 4px 20px rgba(0,0,0,0.15)' : 'none'
      }}>
        {/* 페인트 버튼 */}
        {step === 'edit' && (
          <button
            onClick={() => {
              if (isToolsOpen) {
                // 이미 열려있으면 닫기
                setIsToolsOpen(false);
              } else {
                // 다른 패널이 열려있으면 닫고 페인트 패널 열기
                closeAllToolPanels();
                onToolChange('paint');
                setIsToolsOpen(true);
              }
            }}
            style={getButtonStyle(currentTool === 'paint' || isToolsOpen, 'white', '#4CAF50')}
          >
            🎨
          </button>
        )}
        
        {/* 지우개 버튼 */}
        {step === 'edit' && (
          <button
            onClick={() => {
              if (isEraserOpen) {
                // 이미 열려있으면 닫기
                setIsEraserOpen(false);
              } else {
                // 다른 패널이 열려있으면 닫고 지우개 패널 열기
                closeAllToolPanels();
                onToolChange('eraser');
                setIsEraserOpen(true);
              }
            }}
            style={getButtonStyle(currentTool === 'eraser' || isEraserOpen, 'white', '#f44336')}
            title="지우개"
          >
            🧽
          </button>
        )}

        {/* 오브젝트 버튼 */}
        {step === 'edit' && (
          <button
            onClick={() => {
              if (isObjectsOpen) {
                // 이미 열려있으면 닫기
                setIsObjectsOpen(false);
              } else {
                // 다른 패널이 열려있으면 닫고 오브젝트 패널 열기
                closeAllToolPanels();
                onToolChange('object');
                setIsObjectsOpen(true);
              }
            }}
            style={getButtonStyle(isObjectsOpen, 'white', '#FF9800')}
          >
            🏠
          </button>
        )}



        {/* 체크리스트 버튼 */}
        {step === 'edit' && (
          <button
            onClick={() => {
              if (isChecklistOpen) {
                // 이미 열려있으면 닫기
                setIsChecklistOpen(false);
              } else {
                // 다른 패널이 열려있으면 닫고 체크리스트 패널 열기
                closeAllToolPanels();
                setIsChecklistOpen(true);
              }
            }}
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
          top: isTablet ? '100px' : '80px',
          left: isTablet ? '50%' : '80px',
          transform: isTablet ? 'translateX(-50%)' : 'none',
          backgroundColor: 'white',
          borderRadius: isTablet ? '15px' : '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 999,
          minWidth: isTablet ? '350px' : '250px',
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
            selectedObjectType={selectedObjectType}
            onObjectSelect={onObjectSelect}
          />
        </div>
      )}
      
      {/* 지우개 패널 */}
      {isEraserOpen && step === 'edit' && (
        <div style={{
          position: 'fixed',
          top: isTablet ? '100px' : '140px',
          left: isTablet ? '50%' : '80px',
          transform: isTablet ? 'translateX(-50%)' : 'none',
          backgroundColor: 'white',
          borderRadius: isTablet ? '15px' : '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 999,
          padding: '20px',
          minWidth: isTablet ? '300px' : '200px'
        }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>지우개 크기</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: '#666', minWidth: '30px' }}>크기:</span>
              <input
                type="range"
                min="1"
                max="5"
                value={eraserSize}
                onChange={(e) => setEraserSize(Number(e.target.value))}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: '#ddd',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '20px' }}>{eraserSize}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(size => (
                <button
                  key={size}
                  onClick={() => setEraserSize(size)}
                  style={{
                    width: '30px',
                    height: '30px',
                    border: `2px solid ${eraserSize === size ? '#f44336' : '#ddd'}`,
                    borderRadius: '4px',
                    backgroundColor: eraserSize === size ? '#f44336' : 'white',
                    color: eraserSize === size ? 'white' : '#333',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 오브젝트 패널 */}
      {isObjectsOpen && step === 'edit' && (
        <div style={{
          position: 'fixed',
          top: isTablet ? '100px' : '80px',
          left: isTablet ? '50%' : '80px',
          transform: isTablet ? 'translateX(-50%)' : 'none',
          backgroundColor: 'white',
          borderRadius: isTablet ? '15px' : '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 999,
          minWidth: isTablet ? '350px' : '250px',
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
          top: isTablet ? '100px' : '80px',
          left: isTablet ? '50%' : '80px',
          transform: isTablet ? 'translateX(-50%)' : 'none',
          zIndex: 999
        }}>
          <ChecklistPanel />
        </div>
      )}

      {/* 배경 변경 버튼 */}
      {step === 'edit' && backgroundImage && (
        <div style={{
          position: 'fixed',
          top: isTablet ? '20px' : '20px',
          right: isTablet ? '20px' : '20px',
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
                  <li>한 손가락: 페인트/오브젝트 배치</li>
                  <li>길게 누르기(0.5초): 삭제</li>
                  <li>두 손가락: 지도 이동 및 줌</li>
                  <li>페인트 도구에서 한 손가락 드래그 비활성화</li>
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
      {(isHelpOpen || isChecklistOpen || isEraserOpen) && (
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
            setIsEraserOpen(false);
          }}
        />
      )}
    </>
  );
};

export default FloatingToolbar;