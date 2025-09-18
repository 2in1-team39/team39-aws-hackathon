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
  CLIFF2: { id: 'cliff2', name: '2층 절벽', color: '#5CC648' },
  ROAD: { id: 'road', name: '도로', color: '#BBA774' },
  CUSTOM: { id: 'custom', name: '사용자 정의', color: '#000000' }
};

export const BRUSH_TYPES = {
  SQUARE: 'square',
  ROUNDED: 'rounded',
  // 삼각형 타입들 (내부적으로 사용)
  TRIANGLE_TL: 'triangle-tl',
  TRIANGLE_TR: 'triangle-tr',
  TRIANGLE_BL: 'triangle-bl',
  TRIANGLE_BR: 'triangle-br'
};

export const TOOLS = {
  PAINT: 'paint',
  OBJECT: 'object',
  ERASER: 'eraser'
};