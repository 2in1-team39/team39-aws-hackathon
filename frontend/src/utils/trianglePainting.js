import { BRUSH_TYPES } from '../constants/objectTypes';

// 정교한 브러시 패턴 정의 (삼각형과 사각형 조합)
const getAdvancedBrushPattern = (brushType) => {
  switch (brushType) {
    case BRUSH_TYPES.ROUNDED:
      // 1x1 둥근 브러시 - 전체 사각형
      return {
        squares: [{ x: 0, y: 0 }],
        triangles: []
      };

    case BRUSH_TYPES.DIAMOND_2X2:
      // 2x2 다이아몬드 - 각 칸의 특정 삼각형만
      return {
        squares: [],
        triangles: [
          { x: 0, y: 0, type: BRUSH_TYPES.TRIANGLE_BR }, // 왼쪽 위: 오른쪽 아래 삼각형
          { x: 1, y: 0, type: BRUSH_TYPES.TRIANGLE_BL }, // 오른쪽 위: 왼쪽 아래 삼각형
          { x: 0, y: 1, type: BRUSH_TYPES.TRIANGLE_TR }, // 왼쪽 아래: 오른쪽 위 삼각형
          { x: 1, y: 1, type: BRUSH_TYPES.TRIANGLE_TL }  // 오른쪽 아래: 왼쪽 위 삼각형
        ]
      };

    case BRUSH_TYPES.ROUNDED_2X2:
      // 2x2 둥근 브러시 - 중앙은 전체, 모서리는 삼각형
      return {
        squares: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 }
        ],
        triangles: []
      };

    case BRUSH_TYPES.ROUNDED_3X3:
      // 3x3 둥근 브러시 - 팔각형 모양
      return {
        squares: [
          { x: 1, y: 0 }, // 위쪽 중앙
          { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, // 중간 줄
          { x: 1, y: 2 }  // 아래쪽 중앙
        ],
        triangles: [
          { x: 0, y: 0, type: BRUSH_TYPES.TRIANGLE_BR }, // 왼쪽 위 모서리
          { x: 2, y: 0, type: BRUSH_TYPES.TRIANGLE_BL }, // 오른쪽 위 모서리
          { x: 0, y: 2, type: BRUSH_TYPES.TRIANGLE_TR }, // 왼쪽 아래 모서리
          { x: 2, y: 2, type: BRUSH_TYPES.TRIANGLE_TL }  // 오른쪽 아래 모서리
        ]
      };

    default:
      return { squares: [], triangles: [] };
  }
};

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

// 삼각형 페인팅 데이터 처리 (무조건 덮어쓰기)
export const paintTriangleCell = (paintData, gridX, gridY, triangleType, color) => {
  const key = `${gridX},${gridY}`;
  const newPaintData = { ...paintData };

  // 무조건 새로운 삼각형 데이터로 덮어쓰기
  if (!newPaintData[key] || newPaintData[key].type !== 'triangles') {
    // 사각형이거나 없는 경우 -> 삼각형 타입으로 변경
    newPaintData[key] = {
      type: 'triangles',
      triangles: {}
    };
  }

  // 삼각형 색상 업데이트
  newPaintData[key].triangles[triangleType] = color;

  return newPaintData;
};

// 사각형 페인팅 데이터 처리 (무조건 덮어쓰기)
export const paintSquareCell = (paintData, gridX, gridY, color) => {
  const key = `${gridX},${gridY}`;
  const newPaintData = { ...paintData };

  // 무조건 덮어쓰기
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

// 둥근 브러시 좌표들을 반환 (기존 호환성을 위해 유지)
export const getRoundedBrushCoordinates = (centerX, centerY, brushType) => {
  // 이제 getAdvancedBrushPattern을 사용
  const pattern = getAdvancedBrushPattern(brushType);
  const coordinates = [];

  pattern.squares.forEach(({ x, y }) => {
    coordinates.push({ x: centerX + x, y: centerY + y });
  });

  return coordinates;
};

// 고급 브러시 페인팅 처리 (완전한 셀 덮어쓰기)
export const paintAdvancedBrush = (paintData, centerX, centerY, brushType, color, gridCols, gridRows) => {
  let newPaintData = { ...paintData };
  const pattern = getAdvancedBrushPattern(brushType);

  // 브러시 중심점 계산
  let offsetX = 0, offsetY = 0;

  if (brushType === BRUSH_TYPES.DIAMOND_2X2 || brushType === BRUSH_TYPES.ROUNDED_2X2) {
    offsetX = 0; // 2x2는 0,0부터 시작
    offsetY = 0;
  } else if (brushType === BRUSH_TYPES.ROUNDED_3X3) {
    offsetX = -1; // 3x3는 중심을 기준으로 -1,-1부터 시작
    offsetY = -1;
  }

  // 브러시 패턴이 적용되는 모든 셀을 먼저 파악
  const affectedCells = new Set();

  // 사각형 영역 수집
  pattern.squares.forEach(({ x, y }) => {
    const paintX = centerX + x + offsetX;
    const paintY = centerY + y + offsetY;
    if (paintX >= 0 && paintX < gridCols && paintY >= 0 && paintY < gridRows) {
      affectedCells.add(`${paintX},${paintY}`);
    }
  });

  // 삼각형 영역 수집
  pattern.triangles.forEach(({ x, y }) => {
    const paintX = centerX + x + offsetX;
    const paintY = centerY + y + offsetY;
    if (paintX >= 0 && paintX < gridCols && paintY >= 0 && paintY < gridRows) {
      affectedCells.add(`${paintX},${paintY}`);
    }
  });

  // 각 셀의 새로운 상태 계산
  affectedCells.forEach(cellKey => {
    const [paintX, paintY] = cellKey.split(',').map(Number);

    // 이 셀에 적용되는 사각형과 삼각형 수집
    const cellSquares = pattern.squares.filter(({ x, y }) => {
      const px = centerX + x + offsetX;
      const py = centerY + y + offsetY;
      return px === paintX && py === paintY;
    });

    const cellTriangles = pattern.triangles.filter(({ x, y }) => {
      const px = centerX + x + offsetX;
      const py = centerY + y + offsetY;
      return px === paintX && py === paintY;
    });

    // 사각형이 있으면 전체 셀을 사각형으로
    if (cellSquares.length > 0) {
      newPaintData = paintSquareCell(newPaintData, paintX, paintY, color);
    } else {
      // 사각형이 없고 삼각형만 있으면 해당 삼각형들만
      // 먼저 해당 셀을 비우고 삼각형들을 적용
      const key = `${paintX},${paintY}`;
      newPaintData[key] = {
        type: 'triangles',
        triangles: {}
      };

      cellTriangles.forEach(({ type }) => {
        newPaintData[key].triangles[type] = color;
      });
    }
  });

  return newPaintData;
};

// 둥근 브러시용 페인팅 데이터 처리 (기존 함수는 유지, 호환성을 위해)
export const paintRoundedBrush = (paintData, gridX, gridY, brushType, color, gridCols, gridRows) => {
  return paintAdvancedBrush(paintData, gridX, gridY, brushType, color, gridCols, gridRows);
};


// 2x2 브러시용 페인팅 데이터 처리 (완전한 덮어쓰기)
export const paint2x2Cell = (paintData, gridX, gridY, brushType, color, gridCols, gridRows) => {
  let newPaintData = { ...paintData };

  if (brushType === BRUSH_TYPES.DIAMOND_2X2) {
    // 2x2 다이아몬드: 각 칸을 완전히 덮어쓰기
    const triangles = getDiamond2x2Triangles(gridX, gridY);

    // 각 셀을 완전히 삼각형 타입으로 덮어쓰기
    triangles.forEach(({ x, y, triangle }) => {
      if (x >= 0 && x < gridCols && y >= 0 && y < gridRows) {
        const key = `${x},${y}`;
        // 완전히 새로운 삼각형 데이터로 덮어쓰기
        newPaintData[key] = {
          type: 'triangles',
          triangles: {
            [triangle]: color
          }
        };
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