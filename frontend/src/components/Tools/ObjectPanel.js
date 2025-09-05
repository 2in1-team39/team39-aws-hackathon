import React from 'react';
import { TOOLS } from '../../constants/objectTypes';

const ObjectPanel = ({ 
  currentTool, 
  onToolChange, 
  selectedObjectType,
  onObjectSelect 
}) => {
  const objects = [
    { type: 'tree', name: '나무', icon: '🌳' },
    { type: 'flower', name: '꽃', icon: '🌸' },
    { type: 'house', name: '집', icon: '🏠' },
    { type: 'bridge', name: '다리', icon: '🌉' },
    { type: 'rock', name: '바위', icon: '🪨' },
    { type: 'fence', name: '울타리', icon: '🚧' }
  ];

  return (
    <div style={{
      position: 'relative',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      marginBottom: '10px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>오브젝트</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {objects.map(obj => (
          <button
            key={obj.type}
            onClick={() => {
              onToolChange(TOOLS.OBJECT);
              onObjectSelect({
                type: obj.type,
                name: obj.name,
                image: `/item/${obj.type}.png`
              });
            }}
            style={{
              padding: '8px',
              border: selectedObjectType?.type === obj.type ? '2px solid #4CAF50' : '1px solid #ccc',
              backgroundColor: selectedObjectType?.type === obj.type ? '#e8f5e8' : 'white',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px'
            }}
          >
            <span>{obj.icon}</span>
            <span>{obj.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ObjectPanel;