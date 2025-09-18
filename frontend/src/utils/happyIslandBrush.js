import { BRUSH_TYPES } from '../constants/objectTypes';

// HappyIslandDesigner와 똑같은 브러시 시스템
export class HappyIslandBrush {
  constructor() {
    this.brushType = BRUSH_TYPES.ROUNDED;
    this.brushSize = 2; // 0 = triangle, 1+, 2+, 3+ = different shapes
    this.rawBrushSize = 2;
    this.direction = { x: 0, y: 0 };
  }

  // 삼각형 브러시 포인트 (크기 0일 때만 사용)
  getBrushPointsTriangle(direction = { x: 0, y: 0 }) {
    const p1 = { ...direction };
    const p2 = { ...direction };

    if (direction.x ^ direction.y) { // (1, 0) / (0, 1)
      p1.y = Math.abs(direction.y - 1);
      p2.x = Math.abs(direction.x - 1);
    } else { // (0, 0) / (1, 1)
      p1.x = Math.abs(direction.x - 1);
      p2.y = Math.abs(direction.y - 1);
    }

    return [direction, p1, p2];
  }

  // HappyIslandDesigner와 똑같은 브러시 포인트 생성
  getBrushPoints(size) {
    const sizeX = size;
    const sizeY = size;
    const offset = { x: 0, y: 0 };

    // 크기 0 = 삼각형
    if (size === 0) {
      return this.getBrushPointsTriangle(this.direction);
    }

    switch (this.brushType) {
      case BRUSH_TYPES.SQUARE:
        return [
          { x: offset.x + 0, y: offset.y + 0 },
          { x: offset.x + 0, y: offset.y + sizeY },
          { x: offset.x + sizeX, y: offset.y + sizeY },
          { x: offset.x + sizeX, y: offset.y + 0 },
        ];

      case BRUSH_TYPES.ROUNDED:
        // 크기 1 = 1x1 사각형
        if (size === 1) {
          return [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: 0 },
          ];
        }

        // 크기 2 = 다이아몬드
        if (size === 2) {
          return [
            { x: 1, y: 0 },
            { x: 2, y: 1 },
            { x: 1, y: 2 },
            { x: 0, y: 1 },
          ];
        }

        // 크기 3+ = 팔각형
        const ratio = 0.67;
        const diagonalSize = Math.floor((size / 2) * ratio);
        const straightSize = size - 2 * diagonalSize;

        const minPoint = diagonalSize;
        const maxPoint = diagonalSize + straightSize;

        return [
          { x: offset.x + minPoint, y: offset.y + 0 },
          { x: offset.x + maxPoint, y: offset.y + 0 },
          { x: offset.x + size, y: offset.y + minPoint },
          { x: offset.x + size, y: offset.y + maxPoint },
          { x: offset.x + maxPoint, y: offset.y + size },
          { x: offset.x + minPoint, y: offset.y + size },
          { x: offset.x + 0, y: offset.y + maxPoint },
          { x: offset.x + 0, y: offset.y + minPoint },
        ];

      default:
        return [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 1, y: 0 },
        ];
    }
  }

  // 브러시 중심 좌표 계산 (HappyIslandDesigner와 동일)
  getBrushCenteredCoordinate(rawCoordinate) {
    // 짝수 크기 브러시를 위한 해킹
    if (this.brushSize % 2 === 0) {
      return {
        x: Math.floor(rawCoordinate.x + 0.5) - 0.5,
        y: Math.floor(rawCoordinate.y + 0.5) - 0.5
      };
    }
    return {
      x: Math.floor(rawCoordinate.x),
      y: Math.floor(rawCoordinate.y)
    };
  }

  // 방향 업데이트 (삼각형 브러시용)
  updateDirection(point) {
    if (this.rawBrushSize === 0) {
      const frac = (float) => float - Math.trunc(float);
      this.direction = {
        x: Math.round(frac(point.x)),
        y: Math.round(frac(point.y))
      };
    }
  }

  // 브러시 크기 증가
  incrementBrush() {
    this.rawBrushSize = Math.max(this.brushSize + 1, 0);
    this.brushSize = Math.max(this.rawBrushSize, 1);
  }

  // 브러시 크기 감소
  decrementBrush() {
    this.rawBrushSize = Math.max(this.brushSize - 1, 0);
    this.brushSize = Math.max(this.rawBrushSize, 1);
  }

  // 브러시 타입 변경
  cycleBrushHead() {
    const heads = [BRUSH_TYPES.ROUNDED, BRUSH_TYPES.SQUARE].sort();
    const index = heads.indexOf(this.brushType);
    this.brushType = heads[(index + 1) % heads.length];
  }

  // 현재 브러시가 적용되는 셀들을 반환
  getAffectedCells(centerX, centerY) {
    const points = this.getBrushPoints(this.rawBrushSize);
    const centeredCoord = this.getBrushCenteredCoordinate({ x: centerX, y: centerY });

    // 삼각형인 경우
    if (this.rawBrushSize === 0) {
      return [{
        x: Math.floor(centerX),
        y: Math.floor(centerY),
        type: 'triangle',
        triangleType: this.getTriangleType(),
      }];
    }

    // 일반 브러시인 경우 - 브러시 포인트로 덮인 모든 픽셀을 계산
    const cells = [];
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        if (this.isPointInBrush(x, y, points)) {
          cells.push({
            x: Math.floor(centeredCoord.x + x),
            y: Math.floor(centeredCoord.y + y),
            type: 'square'
          });
        }
      }
    }

    return cells;
  }

  // 점이 브러시 내부에 있는지 확인
  isPointInBrush(x, y, points) {
    // 간단한 point-in-polygon 테스트
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      if (((points[i].y > y) !== (points[j].y > y)) &&
          (x < (points[j].x - points[i].x) * (y - points[i].y) / (points[j].y - points[i].y) + points[i].x)) {
        inside = !inside;
      }
    }
    return inside;
  }

  // 현재 방향에 따른 삼각형 타입 반환
  getTriangleType() {
    const { x, y } = this.direction;

    if (x === 0 && y === 0) return BRUSH_TYPES.TRIANGLE_TL;
    if (x === 1 && y === 0) return BRUSH_TYPES.TRIANGLE_TR;
    if (x === 0 && y === 1) return BRUSH_TYPES.TRIANGLE_BL;
    if (x === 1 && y === 1) return BRUSH_TYPES.TRIANGLE_BR;

    return BRUSH_TYPES.TRIANGLE_TL;
  }
}

// 전역 브러시 인스턴스
export const happyBrush = new HappyIslandBrush();

// HappyIslandDesigner 방식의 페인팅 로직

export const paintWithHappyBrush = (paintData, centerX, centerY, color, gridCols, gridRows) => {
  const newPaintData = { ...paintData };
  const size = happyBrush.rawBrushSize;
  const brushType = happyBrush.brushType;

  // 크기 0: 삼각형 브러시 - HappyIslandDesigner처럼 완전히 덮어쓰기
  if (size === 0) {
    if (centerX >= 0 && centerX < gridCols && centerY >= 0 && centerY < gridRows) {
      const key = `${centerX},${centerY}`;
      const existing = newPaintData[key];

      // 기존에 사각형이 있는 경우에만 우선순위 규칙 적용
      if (existing && existing.type === 'square') {
        // 사각형은 그대로 유지 (삼각형보다 우선순위 높음)
        return newPaintData;
      }

      // 기존 것을 완전히 덮어쓰기
      const triangleType = happyBrush.getTriangleType();
      newPaintData[key] = {
        type: 'triangles',
        triangles: {
          [triangleType]: color
        }
      };
    }
    return newPaintData;
  }

  // 크기 1: 1x1 사각형 - 기존 데이터 완전히 덮어쓰기
  if (size === 1) {
    if (centerX >= 0 && centerX < gridCols && centerY >= 0 && centerY < gridRows) {
      const key = `${centerX},${centerY}`;
      newPaintData[key] = {
        type: 'square',
        color: color
      };
    }
    return newPaintData;
  }

  // 크기 2: 2x2 다이아몬드 (4개 삼각형으로 구성) - 브러시 영역 완전히 덮어쓰기
  if (size === 2 && brushType === BRUSH_TYPES.ROUNDED) {
    const startX = centerX - 1;
    const startY = centerY - 1;

    // 2x2 영역의 각 셀에 삼각형 배치 (기존 데이터 완전히 덮어쓰기)
    const trianglePattern = [
      { dx: 0, dy: 0, triangleType: BRUSH_TYPES.TRIANGLE_BR }, // 왼쪽 위 -> 오른쪽 아래 삼각형
      { dx: 1, dy: 0, triangleType: BRUSH_TYPES.TRIANGLE_BL }, // 오른쪽 위 -> 왼쪽 아래 삼각형
      { dx: 0, dy: 1, triangleType: BRUSH_TYPES.TRIANGLE_TR }, // 왼쪽 아래 -> 오른쪽 위 삼각형
      { dx: 1, dy: 1, triangleType: BRUSH_TYPES.TRIANGLE_TL }  // 오른쪽 아래 -> 왼쪽 위 삼각형
    ];

    trianglePattern.forEach(({ dx, dy, triangleType }) => {
      const x = startX + dx;
      const y = startY + dy;

      if (x >= 0 && x < gridCols && y >= 0 && y < gridRows) {
        const key = `${x},${y}`;
        const existing = newPaintData[key];

        // 기존에 사각형이 있으면 덮어쓰지 않음 (사각형 우선순위)
        if (existing && existing.type === 'square') {
          return; // 사각형은 그대로 유지
        }

        // 기존에 삼각형이 있는 경우
        if (existing && existing.type === 'triangles') {
          const existingTriangles = { ...existing.triangles };

          // 같은 삼각형 위치에 다시 칠하는 경우, 해당 삼각형만 업데이트
          if (existingTriangles[triangleType]) {
            existingTriangles[triangleType] = color;
          } else {
            // 다른 삼각형 위치에 칠하는 경우, 새 삼각형 추가
            existingTriangles[triangleType] = color;
          }

          // 4개 삼각형이 모두 같은 색으로 칠해진 경우 사각형으로 변환
          const triangleColors = Object.values(existingTriangles);
          const uniqueColors = [...new Set(triangleColors)];

          if (Object.keys(existingTriangles).length === 4 && uniqueColors.length === 1) {
            // 모든 삼각형이 같은 색이면 사각형으로 변환
            newPaintData[key] = {
              type: 'square',
              color: color
            };
          } else {
            // 아직 다른 색이거나 4개가 채워지지 않았으면 삼각형 유지
            newPaintData[key] = {
              type: 'triangles',
              triangles: existingTriangles
            };
          }
        } else {
          // 기존 데이터가 없는 경우 새 삼각형 생성
          newPaintData[key] = {
            type: 'triangles',
            triangles: {
              [triangleType]: color
            }
          };
        }
      }
    });

    return newPaintData;
  }

  // 크기 2: 2x2 사각형 (사각 브러시 타입)
  if (size === 2 && brushType === BRUSH_TYPES.SQUARE) {
    const startX = centerX - 1;
    const startY = centerY - 1;

    for (let dx = 0; dx < 2; dx++) {
      for (let dy = 0; dy < 2; dy++) {
        const x = startX + dx;
        const y = startY + dy;

        if (x >= 0 && x < gridCols && y >= 0 && y < gridRows) {
          const key = `${x},${y}`;
          newPaintData[key] = {
            type: 'square',
            color: color
          };
        }
      }
    }

    return newPaintData;
  }

  // 크기 3: 3x3 팔각형 (가운데 십자 5칸은 사각형, 모서리 4칸은 삼각형) - 브러시 영역 완전히 덮어쓰기
  if (size === 3 && brushType === BRUSH_TYPES.ROUNDED) {
    const startX = centerX - 1;
    const startY = centerY - 1;

    // 3x3 영역을 완전히 새로운 팔각형 패턴으로 덮어쓰기

    // 모서리 삼각형들 (4칸)
    const cornerPattern = [
      { dx: 0, dy: 0, triangleType: BRUSH_TYPES.TRIANGLE_BR }, // 왼쪽 위
      { dx: 2, dy: 0, triangleType: BRUSH_TYPES.TRIANGLE_BL }, // 오른쪽 위
      { dx: 0, dy: 2, triangleType: BRUSH_TYPES.TRIANGLE_TR }, // 왼쪽 아래
      { dx: 2, dy: 2, triangleType: BRUSH_TYPES.TRIANGLE_TL }  // 오른쪽 아래
    ];

    cornerPattern.forEach(({ dx, dy, triangleType }) => {
      const x = startX + dx;
      const y = startY + dy;

      if (x >= 0 && x < gridCols && y >= 0 && y < gridRows) {
        const key = `${x},${y}`;
        const existing = newPaintData[key];

        // 기존에 사각형이 있으면 덮어쓰지 않음 (사각형 우선순위)
        if (existing && existing.type === 'square') {
          return; // 사각형은 그대로 유지
        }

        // 사각형이 없는 경우만 삼각형으로 설정
        newPaintData[key] = {
          type: 'triangles',
          triangles: {
            [triangleType]: color
          }
        };
      }
    });

    // 가운데 십자 모양 (5칸)
    const crossPattern = [
      { dx: 1, dy: 0 }, // 위
      { dx: 0, dy: 1 }, // 왼쪽
      { dx: 1, dy: 1 }, // 가운데
      { dx: 2, dy: 1 }, // 오른쪽
      { dx: 1, dy: 2 }  // 아래
    ];

    crossPattern.forEach(({ dx, dy }) => {
      const x = startX + dx;
      const y = startY + dy;

      if (x >= 0 && x < gridCols && y >= 0 && y < gridRows) {
        const key = `${x},${y}`;
        // 기존 데이터를 완전히 덮어쓰기
        newPaintData[key] = {
          type: 'square',
          color: color
        };
      }
    });

    return newPaintData;
  }

  // 크기 3+: 3x3+ 사각형 (사각 브러시 타입) 또는 더 큰 둥근 브러시
  const halfSize = Math.floor(size / 2);
  const startX = centerX - halfSize;
  const startY = centerY - halfSize;

  for (let dx = 0; dx < size; dx++) {
    for (let dy = 0; dy < size; dy++) {
      const x = startX + dx;
      const y = startY + dy;

      if (x >= 0 && x < gridCols && y >= 0 && y < gridRows) {
        const key = `${x},${y}`;
        newPaintData[key] = {
          type: 'square',
          color: color
        };
      }
    }
  }

  return newPaintData;
};