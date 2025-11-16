# SweepPath Implementation Guide

## Overview

The **sweepPath** concept has been implemented for the island designer's diamond (2x2) and octagon (3x3+) brushes. Instead of stamping brush shapes at discrete points along a line, sweepPath morphs (sweeps) the brush shape continuously along the entire drawing path, creating smoother and more connected strokes.

## Key Concepts

### What is SweepPath?

Traditional grid-based painting stamps the brush shape at specific grid points (calculated via Bresenham's line algorithm):
```
Point 1: Stamp brush
  |
  | (gap or overlap)
  |
Point 2: Stamp brush
```

SweepPath sweeps the brush shape along the entire path:
```
Start ───────[Morphing Brush]─────── End
      (continuous, gap-free)
```

### How It Works

1. **Line Point Generation**: Uses Bresenham's line algorithm to calculate all points along the path from start to end
2. **Brush Shape Morphing**: For each line point, applies the brush shape relative to that point
3. **Cell Aggregation**: Collects all affected cells from the entire sweep
4. **Grid-Based Painting**: Paints the affected cells in one batch operation

## Implementation Files

### 1. **SweepPathRenderer.js** (`src/utils/SweepPathRenderer.js`)

Core utility module providing sweepPath functionality.

#### Main Functions

**`getLinePoints(start, end)`**
- Generates all points along a line using Bresenham algorithm
- Returns array of `{x, y, smoothX, smoothY, t}` objects
- `t` represents interpolation parameter (0 to 1)

```javascript
const points = getLinePoints({ x: 0, y: 0 }, { x: 5, y: 5 });
// Returns points along diagonal line
```

**`getBrushShapePoints(size, brushType)`**
- Returns the relative coordinates of the brush shape
- For ROUNDED (diamond/octagon):
  - Size 1: 1x1 square
  - Size 2: 2x2 diamond (4 corners)
  - Size 3+: Octagon shape (8 points)
- For SQUARE: Full square shapes

```javascript
const diamondPoints = getBrushShapePoints(2, BRUSH_TYPES.ROUNDED);
// Returns: [{x: 1, y: 0}, {x: 2, y: 1}, {x: 1, y: 2}, {x: 0, y: 1}]
```

**`generateSweepPathCellsNonRotating(start, end, size, brushType)`**
- Generates all cells affected by sweeping the brush along the path
- Non-rotating variant (preserves grid alignment)
- Returns array of `{x, y}` cell coordinates

```javascript
const affectedCells = generateSweepPathCellsNonRotating(
  { x: 0, y: 0 },
  { x: 5, y: 5 },
  2,
  BRUSH_TYPES.ROUNDED
);
// Returns all cells covered by sweeping a 2x2 diamond
```

**`paintSweepPath(paintData, start, end, size, brushType, color, gridCols, gridRows)`**
- Integrates with the existing happy brush painting system
- Updates paintData with all affected cells
- Currently paints all affected cells as full squares (compatible with happy brush)

```javascript
let newPaintData = paintSweepPath(
  paintData,
  { x: 0, y: 0 },
  { x: 5, y: 5 },
  2,
  BRUSH_TYPES.ROUNDED,
  '#7CD8C3',
  112,
  96
);
```

### 2. **IslandCanvas.js** (`src/components/Canvas/IslandCanvas.js`)

Modified to use sweepPath for diamond and octagon brushes.

#### Changes in `paintCells()` function

**Detection Logic**:
```javascript
const useSweepPath = (currentTool === TOOLS.PAINT &&
                     currentBrushType === BRUSH_TYPES.ROUNDED &&
                     (happyBrush.brushSize === 2 || happyBrush.brushSize >= 3));
```

**SweepPath Usage**:
```javascript
if (useSweepPath && lastPaintPos && selectedColor) {
  newPaintData = paintSweepPath(
    newPaintData,
    { x: lastPaintPos.x, y: lastPaintPos.y },
    { x: gridX, y: gridY },
    happyBrush.brushSize,
    BRUSH_TYPES.ROUNDED,
    selectedColor.color,
    GRID_CONFIG.COLS,
    GRID_CONFIG.ROWS
  );
} else {
  // Falls back to regular cell-based painting
  // Uses existing Bresenham interpolation
}
```

## Brush Shape Definitions

### Diamond (Size 2)
```
    *
   * *
    *
```
Points: `[(1,0), (2,1), (1,2), (0,1)]`

### Octagon (Size 3+)
```
  * * *
 *     *
*       *
 *     *
  * * *
```
- 8 vertices forming octagon
- Uses ratio 0.67 for diagonal sizing
- Provides smooth rounded corners on square brushes

## Integration with Happy Brush System

The implementation maintains compatibility with the existing happy brush system:

1. **Size Constraints**: Respects brush size limits (ROUNDED min 2, SQUARE min 1)
2. **Color Support**: Uses selected colors from the color palette
3. **Grid Bounds**: Checks and respects grid boundaries
4. **Fallback**: Non-sweepPath brushes use traditional cell-based painting

## Performance Considerations

### Optimization Strategies

1. **Non-Rotating Variant**: Uses `generateSweepPathCellsNonRotating()` instead of rotating variant
   - Avoids trigonometric calculations
   - Maintains grid alignment
   - Faster for most use cases

2. **Cell Deduplication**: Uses `Set` to avoid duplicate cells
   - Prevents redundant painting operations
   - More efficient than array operations

3. **Conditional Activation**: Only used for diamond/octagon brushes
   - Regular square brushes use faster cell-based method
   - Other tools unaffected

### Performance Profile

- **Diamond (2x2)**: ~4 cells per line point
- **Octagon (3x3)**: ~8 cells per line point
- **Octagon (5x5)**: ~16 cells per line point
- **Bresenham line points**: ~max(dx, dy) + 1

**Example**: 10-cell diagonal line with size 3 octagon
- Total cells generated: ~10 * 8 = 80 cells
- Actual unique cells: ~30-50 (with deduplication)

## Testing Checklist

- [x] Build succeeds without errors
- [x] Build succeeds without warnings
- [x] Diamond brush (2x2) strokes are smooth and continuous
- [x] Octagon brush (3x3+) strokes are smooth and continuous
- [x] Regular square brushes still work correctly
- [x] Other tools (eraser, objects) unaffected
- [x] Grid boundaries respected
- [x] Colors applied correctly

## Future Enhancements

### Potential Improvements

1. **Triangle Brush Support**: Extend sweepPath for 1x1 triangle brushes
2. **Rotation Variants**: Add rotating version for more natural brush strokes
3. **Smoothing**: Add bezier curve interpolation for smoother paths
4. **Pressure Sensitivity**: Support variable brush size based on input
5. **Anti-Aliasing**: Implement sub-pixel painting for smoother edges

### Advanced Features

```javascript
// Future: Bezier path smoothing
const smoothPath = generateBezierPath(start, end, controlPoints);

// Future: Pressure-sensitive sizing
const dynamicSize = calculateSizeFromPressure(pressure, baseSize);

// Future: Rotation support
const rotatedBrush = rotateBrushShape(brush, angle);
```

## Code Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Canvas/
│   │       └── IslandCanvas.js (modified)
│   └── utils/
│       ├── SweepPathRenderer.js (new)
│       ├── happyIslandBrush.js (existing)
│       └── trianglePainting.js (existing)
└── [other files]
```

## Related Files

- [IslandCanvas.js](src/components/Canvas/IslandCanvas.js#L481) - `paintCells()` function
- [happyIslandBrush.js](src/utils/happyIslandBrush.js) - Brush shape definitions
- [SweepPathRenderer.js](src/utils/SweepPathRenderer.js) - SweepPath implementation

## References

- **Bresenham's Line Algorithm**: Efficient rasterization of lines on grids
- **Happy Island Designer**: Reference implementation for brush behavior
- **Spatial Morphing**: Concept of sweeping shapes along paths

## Troubleshooting

### Issue: Gaps appear in brush strokes
**Solution**: Increase line point density or use larger brush sizes

### Issue: Performance degradation with large brushes
**Solution**: Optimize cell aggregation or implement spatial indexing

### Issue: Strokes don't match cursor preview
**Solution**: Verify brush shape points match cursor generation in App.js

---

**Implementation Date**: 2025-11-16
**Status**: Complete and tested
