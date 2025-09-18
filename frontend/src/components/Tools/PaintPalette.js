import React, { useState } from 'react';
import { PAINT_COLORS } from '../../constants/objectTypes';

const PaintPalette = ({ selectedColor, onColorSelect, onEyedropperToggle, isEyedropperActive }) => {
  const [customColor, setCustomColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);

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
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '10px'
    }}>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        marginBottom: '15px'
      }}>
        {Object.values(PAINT_COLORS).filter(color => color.id !== 'custom').map(color => (
          <button
            key={color.id}
            onClick={() => onColorSelect(color)}
            style={{
              padding: '8px',
              border: selectedColor?.id === color.id ? '3px solid #333' : '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: color.color,
              color: 'white',
              textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {color.name}
          </button>
        ))}

        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          style={{
            padding: '8px',
            border: selectedColor?.id === 'custom' ? '3px solid #333' : '1px solid #ccc',
            borderRadius: '4px',
            background: selectedColor?.id === 'custom'
              ? selectedColor.color
              : `linear-gradient(to right, red, yellow, green, cyan, blue, magenta)`,
            color: 'white',
            textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
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
                padding: '5px 15px',
                backgroundColor: isEyedropperActive ? '#007bff' : '#f8f9fa',
                color: isEyedropperActive ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginRight: '10px'
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
              padding: '5px 15px',
              backgroundColor: customColor,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              textShadow: '1px 1px 1px rgba(0,0,0,0.5)'
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