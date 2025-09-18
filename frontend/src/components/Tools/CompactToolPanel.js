import React from 'react';
import { TOOLS } from '../../constants/objectTypes';
import TriangleBrushPanel from './TriangleBrushPanel';
import PaintPalette from './PaintPalette';

const CompactToolPanel = ({
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
  onObjectSelect
}) => {
  return (
    <div style={{
      position: 'relative',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      marginBottom: '10px'
    }}>
      {/* 페인트 팔레트 컴포넌트 사용 */}
      {currentTool === TOOLS.PAINT && (
        <>
          <PaintPalette
            selectedColor={selectedColor}
            onColorSelect={onColorSelect}
            onEyedropperToggle={onEyedropperToggle}
            isEyedropperActive={isEyedropperActive}
          />

          <TriangleBrushPanel
            currentBrushType={currentBrushType}
            onBrushTypeChange={setCurrentBrushType}
            brushSize={brushSize}
            onBrushSizeChange={(size, rawSize) => {
              setBrushSize(size);
              // rawSize는 추가 정보로 필요시 사용
            }}
          />
        </>
      )}

      {/* 다른 도구들 */}
      {currentTool !== TOOLS.PAINT && (
        <div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>도구</h3>
          <p style={{ fontSize: '12px', color: '#666' }}>
            {currentTool === TOOLS.ERASER && '지우개가 선택되었습니다.'}
            {currentTool === TOOLS.OBJECT && '오브젝트 도구가 선택되었습니다.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompactToolPanel;