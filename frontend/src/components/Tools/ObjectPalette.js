import React, { useState, useEffect } from 'react';

const ObjectPalette = ({ onObjectSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('tree');
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);

  const categories = {
    tree: { name: '나무', folder: 'tree' },
    flower: { name: '꽃', folder: 'flower' },
    construction: { name: '건설', folder: 'construction' },
    structure: { name: '건물', folder: 'structure' }
  };

  const objectFiles = {
    tree: ['tree.png', 'tree-apple.png', 'tree-cherry.png', 'tree-orange.png', 'tree-peach.png', 'tree-pear.png', 'palm.png', 'pine.png'],
    flower: ['redroses.png', 'whiteroses.png', 'yellowroses.png', 'pinktulips.png', 'redtulips.png', 'whitetulips.png', 'yellowtulips.png', 'orangetulips.png'],
    construction: ['bridge-stone-horizontal.png', 'bridge-wood-horizontal.png', 'stairs-stone-up.png', 'stairs-wood-up.png'],
    structure: ['airport.png', 'building-house.png', 'building-museum.png', 'building-nook.png', 'building-townhall.png']
  };

  useEffect(() => {
    const categoryFiles = objectFiles[selectedCategory] || [];
    const categoryObjects = categoryFiles.map(file => ({
      id: file,
      name: file.replace('.png', '').replace(/-/g, ' '),
      image: `/item/${categories[selectedCategory].folder}/${file}`,
      type: selectedCategory
    }));
    setObjects(categoryObjects);
  }, [selectedCategory]);

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '10px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>오브젝트</h4>
      
      {/* 카테고리 선택 */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '10px',
        flexWrap: 'wrap'
      }}>
        {Object.entries(categories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedCategory(key);
              setSelectedObject(null);
            }}
            style={{
              padding: '4px 8px',
              border: selectedCategory === key ? '2px solid #4CAF50' : '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: selectedCategory === key ? '#e8f5e8' : 'white',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* 오브젝트 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {objects.map(obj => (
          <button
            key={obj.id}
            onClick={() => {
              setSelectedObject(obj.id);
              onObjectSelect(obj);
            }}
            style={{
              padding: '6px',
              border: selectedObject === obj.id ? '2px solid #4CAF50' : '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: selectedObject === obj.id ? '#e8f5e8' : 'white',
              cursor: 'pointer',
              fontSize: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              minHeight: '60px'
            }}
          >
            <img 
              src={obj.image} 
              alt={obj.name}
              style={{
                width: '24px',
                height: '24px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span style={{ fontSize: '9px', textAlign: 'center' }}>
              {obj.name.length > 8 ? obj.name.substring(0, 8) + '...' : obj.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ObjectPalette;