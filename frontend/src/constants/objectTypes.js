export const OBJECT_TYPES = {
  TREE: 'tree',
  BUILDING: 'building',
  DECORATION: 'decoration',
  BRIDGE: 'bridge',
  INCLINE: 'incline'
};

export const PAINT_COLORS = {
  WATER: { id: 'water', name: '강물', color: '#7CD8C3' },
  ROCK: { id: 'rock', name: '암석', color: '#6E7884' },
  SAND: { id: 'sand', name: '모래', color: '#EEE6A5' },
  ISLAND: { id: 'island', name: '섬', color: '#417B41' },
  CLIFF1: { id: 'cliff1', name: '1층 절벽', color: '#3D9B3A' },
  CLIFF2: { id: 'cliff2', name: '2엵 절벽', color: '#5CC648' },
  ROAD: { id: 'road', name: '도로', color: '#BBA774' }
};

export const BRUSH_TYPES = {
  SQUARE: 'square',
  TRIANGLE_TL: 'triangle-tl', // 왼쪽 위 삼각형
  TRIANGLE_TR: 'triangle-tr', // 오른쪽 위 삼각형
  TRIANGLE_BL: 'triangle-bl', // 왼쪽 아래 삼각형
  TRIANGLE_BR: 'triangle-br', // 오른쪽 아래 삼각형
  AUTO: 'auto' // 클릭 위치에 따라 자동 결정
};

export const TOOLS = {
  PAINT: 'paint',
  OBJECT: 'object',
  ERASER: 'eraser'
};