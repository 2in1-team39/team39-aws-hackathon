import React, { useState } from 'react';
import { OBJECT_TYPES } from '../../constants/objectTypes';

const ObjectPalette = ({ onObjectSelect }) => {
  const [selectedObject, setSelectedObject] = useState(null);

  const objects = [
    { type: OBJECT_TYPES.TREE, name: '나무', color: '#228B22', icon: '🌳' },
    { type: OBJECT_TYPES.BUILDING, name: '건물', color: '#8B4513', icon: '🏠' },
    { type: OBJECT_TYPES.DECORATION, name: '장식', color: '#FF69B4', icon: '🌸' },
    { type: OBJECT_TYPES.BRIDGE, name: '다리', color: '#A0522D', icon: '🌉' },
    { type: OBJECT_TYPES.INCLINE, name: '경사로', color: '#696969', icon: '⛰️' }
  ];

  const handleObjectClick = (obj) => {
    setSelectedObject(obj);
    onObjectSelect(obj);
  };

  return (
    <div style={{ 
      padding: '10px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px',
      marginBottom: '10px'
    }}>
      <h3>오브젝트</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {objects.map(obj => (
          <button
            key={obj.type}
            onClick={() => handleObjectClick(obj)}
            style={{
              padding: '10px',
              border: selectedObject?.type === obj.type ? '2px solid #4CAF50' : '1px solid #ccc',
              backgroundColor: selectedObject?.type === obj.type ? '#e8f5e8' : 'white',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '16px' }}>{obj.icon}</span>
            <span style={{ fontSize: '12px' }}>{obj.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ObjectPalette;