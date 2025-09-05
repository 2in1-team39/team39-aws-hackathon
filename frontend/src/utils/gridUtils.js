import { GRID_CONFIG } from '../constants/gridConfig';

export const pixelToGrid = (x, y) => {
  return {
    gridX: Math.floor(x / GRID_CONFIG.CELL_SIZE),
    gridY: Math.floor(y / GRID_CONFIG.CELL_SIZE)
  };
};

export const gridToPixel = (gridX, gridY) => {
  return {
    x: gridX * GRID_CONFIG.CELL_SIZE,
    y: gridY * GRID_CONFIG.CELL_SIZE
  };
};

export const snapToGrid = (x, y) => {
  const { gridX, gridY } = pixelToGrid(x, y);
  return gridToPixel(gridX, gridY);
};

export const isValidGridPosition = (gridX, gridY) => {
  return gridX >= 0 && gridX < GRID_CONFIG.COLS && 
         gridY >= 0 && gridY < GRID_CONFIG.ROWS;
};