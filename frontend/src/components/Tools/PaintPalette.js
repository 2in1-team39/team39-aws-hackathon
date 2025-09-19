import React, { useState } from 'react';
import { PAINT_COLORS } from '../../constants/objectTypes';

const PaintPalette = ({ selectedColor, onColorSelect, onEyedropperToggle, isEyedropperActive }) => {
  const [customColor, setCustomColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 디바이스 감지
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isTablet = isTouchDevice && (window.innerWidth >= 768 && window.innerWidth <= 1024);

  const handleCustomColorSelect = () => {
    const customColorObj = {
      id: 'custom',
      name: '사용자 정의',
      color: customColor
    };
    onColorSelect(customColorObj);
    setShowColorPicker(false);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: isTablet ? '12px' : '8px',
      padding: isTablet ? '20px' : '15px',
      marginBottom: isTablet ? '15px' : '10px'
    }}>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: isTablet ? '12px' : '8px',
        marginBottom: isTablet ? '20px' : '15px'
      }}>
        {Object.values(PAINT_COLORS).filter(color => color.id !== 'custom').map(color => (
          <button
            key={color.id}
            onClick={() => onColorSelect(color)}
            style={{
              padding: isTablet ? '12px' : '8px',
              border: selectedColor?.id === color.id ? '3px solid #333' : '1px solid #ccc',
              borderRadius: isTablet ? '8px' : '4px',
              backgroundColor: color.color,
              color: 'white',
              textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              fontSize: isTablet ? '16px' : '12px',
              minHeight: isTablet ? '50px' : 'auto',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            {color.name}
          </button>
        ))}

        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          style={{
            padding: isTablet ? '12px' : '8px',
            border: selectedColor?.id === 'custom' ? '3px solid #333' : '1px solid #ccc',
            borderRadius: isTablet ? '8px' : '4px',
            background: selectedColor?.id === 'custom'
              ? selectedColor.color
              : `linear-gradient(to right, red, yellow, green, cyan, blue, magenta)`,
            color: 'white',
            textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            fontSize: isTablet ? '16px' : '12px',
            fontWeight: 'bold',
            minHeight: isTablet ? '50px' : 'auto',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          사용자 정의
        </button>
      </div>

      {showColorPicker && (
        <div style={{
          marginBottom: '15px',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', marginRight: '10px' }}>
              색상 선택:
            </label>
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              style={{
                width: '50px',
                height: '30px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
            <span style={{
              marginLeft: '10px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              {customColor}
            </span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={onEyedropperToggle}
              style={{
                padding: isTablet ? '10px 20px' : '5px 15px',
                backgroundColor: isEyedropperActive ? '#007bff' : '#f8f9fa',
                color: isEyedropperActive ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: isTablet ? '8px' : '4px',
                cursor: 'pointer',
                fontSize: isTablet ? '16px' : '12px',
                marginRight: '10px',
                minHeight: isTablet ? '44px' : 'auto',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              🎨 스포이드
            </button>
            <span style={{ fontSize: '11px', color: '#666' }}>
              {isEyedropperActive ? '캔버스에서 색상을 클릭하세요' : '색상을 추출하려면 스포이드를 활성화하세요'}
            </span>
          </div>

          <button
            onClick={handleCustomColorSelect}
            style={{
              padding: isTablet ? '10px 20px' : '5px 15px',
              backgroundColor: customColor,
              color: 'white',
              border: 'none',
              borderRadius: isTablet ? '8px' : '4px',
              cursor: 'pointer',
              fontSize: isTablet ? '16px' : '12px',
              textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
              minHeight: isTablet ? '44px' : 'auto',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            이 색상 사용
          </button>
        </div>
      )}
    </div>
  );
};

export default PaintPalette;