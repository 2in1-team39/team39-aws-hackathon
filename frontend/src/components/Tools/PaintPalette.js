import React, { useState } from 'react';
import { PAINT_COLORS } from '../../constants/objectTypes';

const PaintPalette = ({ selectedColor, onColorSelect }) => {
  const [customColor, setCustomColor] = useState('#000000');
  const colorInputRef = React.useRef(null);

  // 디바이스 감지
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isTablet = isTouchDevice && (window.innerWidth >= 768 && window.innerWidth <= 1024);

  const handleCustomColorChange = (color) => {
    setCustomColor(color);
    const customColorObj = {
      id: 'custom',
      name: '사용자 정의',
      color: color
    };
    onColorSelect(customColorObj);
  };

  const handleCustomColorButtonClick = () => {
    colorInputRef.current?.click();
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
          onClick={handleCustomColorButtonClick}
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

        {/* 숨겨진 color input */}
        <input
          ref={colorInputRef}
          type="color"
          value={customColor}
          onChange={(e) => handleCustomColorChange(e.target.value)}
          style={{ display: 'none' }}
        />
      </div>

    </div>
  );
};

export default PaintPalette;