import React from 'react';
import { TOOLS } from '../../constants/objectTypes';

const ToolPanel = ({ currentTool, onToolChange }) => {
  const tools = [

    { id: TOOLS.PAINT, name: '페인트', icon: '🎨' },
    { id: TOOLS.OBJECT, name: '오브젝트', icon: '🏠' },
    { id: TOOLS.ERASER, name: '지우개', icon: '🧽' }
  ];

  return (
    <div style={{ 
      padding: '10px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px',
      marginBottom: '10px'
    }}>
      <h3>도구</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            style={{
              padding: '10px 15px',
              border: currentTool === tool.id ? '2px solid #4CAF50' : '1px solid #ccc',
              backgroundColor: currentTool === tool.id ? '#e8f5e8' : 'white',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span style={{ fontSize: '20px' }}>{tool.icon}</span>
            <span style={{ fontSize: '12px' }}>{tool.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToolPanel;