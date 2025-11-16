/**
 * PathHelpers - Utility functions for brush path operations
 * Implements sweep algorithm to eliminate gaps in line drawing
 */

/**
 * Bresenham's line algorithm - calls callback for each cell on line
 */
export const doForCellsOnLine = (x0, y0, x1, y1, callback) => {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let x = x0;
  let y = y0;

  while (true) {
    callback(x, y);

    if (x === x1 && y === y1) break;

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
};

/**
 * Sweep brush points in a direction to fill gaps
 * Creates convex hull of original points and delta-shifted points
 */
export const sweepBrushPoints = (brushPoints, deltaX, deltaY) => {
  if (deltaX === 0 && deltaY === 0) {
    return brushPoints;
  }

  const sweptPoints = [...brushPoints];

  // Add delta-shifted versions of brush points
  for (const point of brushPoints) {
    sweptPoints.push({
      x: point.x + deltaX,
      y: point.y + deltaY,
    });
  }

  // Return all swept points (implicit convex hull)
  return sweptPoints;
};

/**
 * Cross product of vectors OA and OB (for convex hull)
 */
const crossProduct = (o, a, b) => {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
};

/**
 * Graham Scan algorithm for convex hull
 * Removes collinear/interior points from swept brush points
 */
export const getConvexHull = (points) => {
  if (points.length < 3) return points;

  // Deep copy and sort by coordinates
  const pts = points.map(p => ({ x: p.x, y: p.y }));

  // Find pivot - bottommost, then leftmost
  let pivot = pts[0];
  for (const p of pts) {
    if (p.y < pivot.y || (p.y === pivot.y && p.x < pivot.x)) {
      pivot = p;
    }
  }

  // Sort by polar angle
  const sorted = pts
    .filter((p) => p !== pivot)
    .sort((a, b) => {
      const angleA = Math.atan2(a.y - pivot.y, a.x - pivot.x);
      const angleB = Math.atan2(b.y - pivot.y, b.x - pivot.x);
      return angleA - angleB;
    });

  const hull = [pivot, sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    let top = hull[hull.length - 1];
    let nextTop = hull[hull.length - 2];

    while (
      hull.length > 1 &&
      crossProduct(nextTop, top, sorted[i]) <= 0
    ) {
      hull.pop();
      top = hull[hull.length - 1];
      nextTop = hull[hull.length - 2];
    }

    hull.push(sorted[i]);
  }

  return hull;
};

/**
 * Get centered coordinate for a brush position
 * Mimics HappyIslandBrush.getBrushCenteredCoordinate
 */
export const getCenteredCoordinate = (position, brushSize) => {
  if (brushSize % 2 === 0) {
    // Even size brushes (like diamond 2x2, octagon)
    return {
      x: Math.floor(position.x + 0.5) - 0.5,
      y: Math.floor(position.y + 0.5) - 0.5
    };
  }
  // Odd size brushes
  return {
    x: Math.floor(position.x),
    y: Math.floor(position.y)
  };
};

/**
 * Calculate brush shape points for a given size
 * Returns polygon vertices relative to (0,0)
 */
export const getBrushShapePoints = (size, brushType = 'rounded') => {
  if (size <= 0) return [];

  switch (brushType) {
    case 'rounded':
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
        { x: minPoint, y: 0 },
        { x: maxPoint, y: 0 },
        { x: size, y: minPoint },
        { x: size, y: maxPoint },
        { x: maxPoint, y: size },
        { x: minPoint, y: size },
        { x: 0, y: maxPoint },
        { x: 0, y: minPoint }
      ];

    case 'square':
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

const PathHelpers = {
  doForCellsOnLine,
  sweepBrushPoints,
  getConvexHull,
  getCenteredCoordinate,
  getBrushShapePoints
};

export default PathHelpers;
