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

// 2x2 다이아몬드 모양의 삼각형 배치를 반환
export const getDiamond2x2Triangles = (centerX, centerY) => {
  return [
    { x: centerX, y: centerY, triangle: BRUSH_TYPES.TRIANGLE_BR },         // 왼쪽 위 칸: 오른쪽 아래 삼각형
    { x: centerX + 1, y: centerY, triangle: BRUSH_TYPES.TRIANGLE_BL },     // 오른쪽 위 칸: 왼쪽 아래 삼각형  
    { x: centerX, y: centerY + 1, triangle: BRUSH_TYPES.TRIANGLE_TR },     // 왼쪽 아래 칸: 오른쪽 위 삼각형
    { x: centerX + 1, y: centerY + 1, triangle: BRUSH_TYPES.TRIANGLE_TL }  // 오른쪽 아래 칸: 왼쪽 위 삼각형
  ];
};

// 2x2 사각형 모양의 좌표들을 반환
export const getSquare2x2Coordinates = (centerX, centerY) => {
  return [
    { x: centerX, y: centerY },
    { x: centerX + 1, y: centerY },
    { x: centerX, y: centerY + 1 },
    { x: centerX + 1, y: centerY + 1 }
  ];
};


// 2x2 브러시용 페인팅 데이터 처리
export const paint2x2Cell = (paintData, gridX, gridY, brushType, color, gridCols, gridRows) => {
  let newPaintData = { ...paintData };

  if (brushType === BRUSH_TYPES.DIAMOND_2X2) {
    // 2x2 다이아몬드: 각 칸을 삼각형으로 칠해서 전체 다이아몬드 모양 만들기
    const triangles = getDiamond2x2Triangles(gridX, gridY);
    triangles.forEach(({ x, y, triangle }) => {
      if (x >= 0 && x < gridCols && y >= 0 && y < gridRows) {
        newPaintData = paintTriangleCell(newPaintData, x, y, triangle, color);
      }
    });
  } else if (brushType === BRUSH_TYPES.SQUARE_2X2) {
    // 2x2 사각형: 각 칸을 사각형으로 칠하기
    const coordinates = getSquare2x2Coordinates(gridX, gridY);
    coordinates.forEach(({ x, y }) => {
      if (x >= 0 && x < gridCols && y >= 0 && y < gridRows) {
        newPaintData = paintSquareCell(newPaintData, x, y, color);
      }
    });
  }

  return newPaintData;
};


// 직선 그리기에서 끝점 처리 (다이아몬드용)
export const getLineEndPoints = (startX, startY, endX, endY, brushType) => {
  const points = [];
  
  if (brushType === BRUSH_TYPES.DIAMOND_2X2) {
    // 시작점에서 다이아몬드의 뾰족한 부분
    if (startX !== endX || startY !== endY) {
      const dx = endX - startX;
      const dy = endY - startY;
      
      // 방향에 따른 시작점 조정
      if (Math.abs(dx) > Math.abs(dy)) {
        // 수평 방향
        const startTipX = dx > 0 ? startX - 1 : startX + 1;
        points.push({ x: startTipX, y: startY, type: 'diamond-tip' });
        const endTipX = dx > 0 ? endX + 1 : endX - 1;
        points.push({ x: endTipX, y: endY, type: 'diamond-tip' });
      } else {
        // 수직 방향
        const startTipY = dy > 0 ? startY - 1 : startY + 1;
        points.push({ x: startX, y: startTipY, type: 'diamond-tip' });
        const endTipY = dy > 0 ? endY + 1 : endY - 1;
        points.push({ x: endX, y: endTipY, type: 'diamond-tip' });
      }
    }
  }
  
  return points;
};