import { BRUSH_TYPES } from '../constants/objectTypes';

// 격자 내 서브 위치 계산 (0~1 사이의 값)
export const getSubGridPosition = (imageX, imageY, cellSize, zoomLevel) => {
  const localX = (imageX / zoomLevel) % cellSize;
  const localY = (imageY / zoomLevel) % cellSize;

  const subX = localX / cellSize;
  const subY = localY / cellSize;

  return { subX, subY };
};

// 클릭 위치에 따른 삼각형 타입 결정
export const getTriangleTypeFromPosition = (subX, subY) => {
  // 대각선을 기준으로 삼각형 영역 결정
  if (subX + subY < 1) {
    // 왼쪽 위 삼각형 (대각선 위쪽)
    return subX < subY ? BRUSH_TYPES.TRIANGLE_TL : BRUSH_TYPES.TRIANGLE_TR;
  } else {
    // 오른쪽 아래 삼각형 (대각선 아래쪽)  
    return subX < subY ? BRUSH_TYPES.TRIANGLE_BL : BRUSH_TYPES.TRIANGLE_BR;
  }
};

// 삼각형 path 데이터 생성
export const createTrianglePath = (type, cellSize) => {
  switch (type) {
    case BRUSH_TYPES.TRIANGLE_TL:
      return `M 0,0 L ${cellSize},0 L 0,${cellSize} Z`;
    case BRUSH_TYPES.TRIANGLE_TR:
      return `M 0,0 L ${cellSize},0 L ${cellSize},${cellSize} Z`;
    case BRUSH_TYPES.TRIANGLE_BL:
      return `M 0,0 L 0,${cellSize} L ${cellSize},${cellSize} Z`;
    case BRUSH_TYPES.TRIANGLE_BR:
      return `M ${cellSize},0 L ${cellSize},${cellSize} L 0,${cellSize} Z`;
    default:
      return `M 0,0 L ${cellSize},0 L ${cellSize},${cellSize} L 0,${cellSize} Z`;
  }
};

// 삼각형 페인팅 데이터 처리
export const paintTriangleCell = (paintData, gridX, gridY, triangleType, color) => {
  const key = `${gridX},${gridY}`;
  const newPaintData = { ...paintData };

  if (!newPaintData[key]) {
    newPaintData[key] = {
      type: 'triangles',
      triangles: {}
    };
  }

  // 기존 사각형이 있으면 삼각형으로 변환
  if (newPaintData[key].type === 'square' || typeof newPaintData[key] === 'string') {
    newPaintData[key] = {
      type: 'triangles',
      triangles: {
        [triangleType]: color
      }
    };
  } else {
    // 삼각형 추가/업데이트
    newPaintData[key].triangles[triangleType] = color;
  }

  return newPaintData;
};

// 사각형 페인팅 데이터 처리
export const paintSquareCell = (paintData, gridX, gridY, color) => {
  const key = `${gridX},${gridY}`;
  const newPaintData = { ...paintData };

  newPaintData[key] = {
    type: 'square',
    color: color
  };

  return newPaintData;
};

// 페인팅 데이터 삭제
export const erasePaintCell = (paintData, gridX, gridY) => {
  const key = `${gridX},${gridY}`;
  const newPaintData = { ...paintData };
  
  delete newPaintData[key];
  
  return newPaintData;
};