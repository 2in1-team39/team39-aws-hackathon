import React, { useState } from 'react';
import { TOOLS, PAINT_COLORS } from '../../constants/objectTypes';
import TriangleBrushPanel from './TriangleBrushPanel';

const CompactToolPanel = ({ 
  currentTool, 
  onToolChange, 
  selectedColor, 
  onColorSelect, 
  brushSize, 
  setBrushSize,
  currentBrushType,
  setCurrentBrushType,
  selectedObjectType,
  onObjectSelect 
}) => {
  const paintColors = Object.values(PAINT_COLORS);

  return (
    <div style={{
      position: 'relative',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      marginBottom: '10px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>페인트 색상</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {paintColors.map(color => (
          <button
            key={color.id}
            onClick={() => {
              onToolChange(TOOLS.PAINT);
              onColorSelect(color);
            }}
            style={{
              padding: '8px',
              border: selectedColor?.id === color.id ? '2px solid #4CAF50' : '1px solid #ccc',
              backgroundColor: 'white',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px'
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: color.color,
              borderRadius: '3px',
              border: '1px solid #ccc'
            }} />
            <span>{color.name}</span>
          </button>
        ))}
      </div>

      {/* 브러시 크기 조절 */}
      {currentTool === TOOLS.PAINT && (
        <div style={{ marginTop: '10px' }}>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>
            브러시 크기: {brushSize}×{brushSize}
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* 브러시 타입 선택 */}
      {currentTool === TOOLS.PAINT && (
        <TriangleBrushPanel
          currentBrushType={currentBrushType}
          onBrushTypeChange={setCurrentBrushType}
        />
      )}
    </div>
  );
};

export default CompactToolPanel;