import { BRUSH_TYPES } from '../constants/objectTypes';

/**
 * SweepPathRenderer - Renders brush strokes by sweeping brush shapes along a path
 * instead of stamping them at discrete points.
 *
 * This creates smoother, more connected strokes for diamond and octagon brushes
 * by morphing the brush shape along the entire drawing path.
 */

/**
 * Interpolate between two points using linear interpolation
 */
export const interpolatePoint = (p1, p2, t) => {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t
  };
};

/**
 * Calculate distance between two points
 */
export const distance = (p1, p2) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Get angle (in radians) between two points
 */
export const getAngle = (p1, p2) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

/**
 * Rotate a point around an origin by angle (in radians)
 */
export const rotatePoint = (point, origin, angle) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: origin.x + (point.x - origin.x) * cos - (point.y - origin.y) * sin,
    y: origin.y + (point.x - origin.x) * sin + (point.y - origin.y) * cos
  };
};

/**
 * Get brush shape points for a given size and type
 * Returns points relative to center (0, 0)
 */
export const getBrushShapePoints = (size, brushType) => {
  if (size <= 0) {
    return [];
  }

  switch (brushType) {
    case BRUSH_TYPES.ROUNDED:
      if (size === 1) {
        // 1x1 square
        return [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 0, y: 1 }
        ];
      }
      if (size === 2) {
        // 2x2 diamond
        return [
          { x: 1, y: 0 },
          { x: 2, y: 1 },
          { x: 1, y: 2 },
          { x: 0, y: 1 }
        ];
      }
      // 3+ = octagon
      const ratio = 0.67;
      const diagonalSize = Math.floor((size / 2) * ratio);
      const straightSize = size - 2 * diagonalSize;
      const minPoint = diagonalSize;
      const maxPoint = diagonalSize + straightSize;

      return [
        // Top edge
        { x: minPoint, y: 0 },
        { x: maxPoint, y: 0 },
        // Top-right
        { x: size, y: minPoint },
        { x: size, y: maxPoint },
        // Bottom edge
        { x: maxPoint, y: size },
        { x: minPoint, y: size },
        // Bottom-left
        { x: 0, y: maxPoint },
        { x: 0, y: minPoint }
      ];

    case BRUSH_TYPES.SQUARE:
      // All square brushes are full squares
      const halfSize = Math.floor(size / 2);
      return [
        { x: -halfSize, y: -halfSize },
        { x: halfSize, y: -halfSize },
        { x: halfSize, y: halfSize },
        { x: -halfSize, y: halfSize }
      ];

    default:
      return [];
  }
};

/**
 * Create interpolated points along a line using Bresenham-like algorithm
 * Returns array of points with interpolation parameter t (0 to 1)
 */
export const getLinePoints = (start, end) => {
  const points = [];
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const sx = start.x < end.x ? 1 : -1;
  const sy = start.y < end.y ? 1 : -1;
  let err = dx - dy;

  let x = start.x;
  let y = start.y;
  const totalSteps = dx + dy;

  for (let i = 0; i <= totalSteps; i++) {
    const t = totalSteps > 0 ? i / totalSteps : 0;

    // Smooth interpolation using actual coordinates
    const smoothPoint = interpolatePoint(start, end, t);

    points.push({
      x: x,
      y: y,
      smoothX: smoothPoint.x,
      smoothY: smoothPoint.y,
      t: t
    });

    if (x === end.x && y === end.y) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return points;
};

/**
 * Generate all cells affected by sweeping a brush shape along a path
 * Returns array of {x, y, cellType} where cellType is 'square' or 'triangle'
 */
export const generateSweepPathCells = (startPoint, endPoint, brushSize, brushType) => {
  const affectedCells = new Set();
  const linePoints = getLinePoints(startPoint, endPoint);
  const brushPoints = getBrushShapePoints(brushSize, brushType);

  // For each point along the line
  linePoints.forEach(linePoint => {
    // Get angle for rotation
    let angle = 0;
    if (linePoints.length > 1) {
      const nextIdx = Math.min(linePoints.indexOf(linePoint) + 1, linePoints.length - 1);
      if (linePoints[nextIdx] !== linePoint) {
        angle = getAngle(linePoint, linePoints[nextIdx]);
      }
    }

    // Apply each brush point relative to this line point
    brushPoints.forEach(brushPoint => {
      // Rotate brush point by line direction
      const rotated = rotatePoint(
        brushPoint,
        { x: 0, y: 0 },
        angle
      );

      // Calculate final position
      const finalX = Math.round(linePoint.x + rotated.x);
      const finalY = Math.round(linePoint.y + rotated.y);

      const key = `${finalX},${finalY}`;
      if (!affectedCells.has(key)) {
        affectedCells.add(key);
      }
    });
  });

  return Array.from(affectedCells).map(key => {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  });
};

/**
 * Generate sweep path cells using simpler non-rotating method
 * (More suitable for grid-based painting where rotation may cause artifacts)
 */
export const generateSweepPathCellsNonRotating = (startPoint, endPoint, brushSize, brushType) => {
  const affectedCells = new Set();
  const linePoints = getLinePoints(startPoint, endPoint);
  const brushPoints = getBrushShapePoints(brushSize, brushType);

  // Calculate center offset for brush shape
  let centerOffsetX = 0;
  let centerOffsetY = 0;

  if (brushType === BRUSH_TYPES.SQUARE) {
    const halfSize = Math.floor(brushSize / 2);
    centerOffsetX = -halfSize;
    centerOffsetY = -halfSize;
  }

  // For each point along the line
  linePoints.forEach(linePoint => {
    // Apply each brush point relative to this line point
    brushPoints.forEach(brushPoint => {
      const finalX = Math.round(linePoint.x + brushPoint.x + centerOffsetX);
      const finalY = Math.round(linePoint.y + brushPoint.y + centerOffsetY);

      const key = `${finalX},${finalY}`;
      if (!affectedCells.has(key)) {
        affectedCells.add(key);
      }
    });
  });

  return Array.from(affectedCells).map(key => {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  });
};

/**
 * Paint sweep path into paintData
 * Integrates with existing happy brush painting system
 */
export const paintSweepPath = (paintData, startPoint, endPoint, brushSize, brushType, color, gridCols, gridRows) => {
  let newPaintData = { ...paintData };

  // Use non-rotating version for better grid alignment
  const affectedCells = generateSweepPathCellsNonRotating(startPoint, endPoint, brushSize, brushType);

  // Paint each affected cell
  affectedCells.forEach(cell => {
    if (cell.x >= 0 && cell.x < gridCols && cell.y >= 0 && cell.y < gridRows) {
      const key = `${cell.x},${cell.y}`;

      // For diamond/octagon brushes: paint as squares
      // For other brushes: paint as appropriate shape
      newPaintData[key] = {
        type: 'square',
        color: color
      };
    }
  });

  return newPaintData;
};

/**
 * Generate intermediate points for smooth animation/preview
 * Useful for visualizing the sweep path before applying
 */
export const getSweepPathPreviewPoints = (startPoint, endPoint, brushSize, brushType) => {
  const linePoints = getLinePoints(startPoint, endPoint);
  const previewPoints = [];

  linePoints.forEach(linePoint => {
    const brushShapePoints = getBrushShapePoints(brushSize, brushType);
    const cellsAtThisPoint = brushShapePoints.map(bp => ({
      x: Math.round(linePoint.x + bp.x),
      y: Math.round(linePoint.y + bp.y)
    }));

    previewPoints.push({
      linePoint: { x: Math.round(linePoint.x), y: Math.round(linePoint.y) },
      affectedCells: cellsAtThisPoint
    });
  });

  return previewPoints;
};

const SweepPathRenderer = {
  interpolatePoint,
  distance,
  getAngle,
  rotatePoint,
  getBrushShapePoints,
  getLinePoints,
  generateSweepPathCells,
  generateSweepPathCellsNonRotating,
  paintSweepPath,
  getSweepPathPreviewPoints
};

export default SweepPathRenderer;
