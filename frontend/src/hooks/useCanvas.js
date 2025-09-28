import { useState, useRef } from 'react';
import { TOOLS, PAINT_COLORS, BRUSH_TYPES } from '../constants/objectTypes';

export const useCanvas = () => {
  const [currentTool, setCurrentTool] = useState(TOOLS.PAINT);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [objects, setObjects] = useState([]);
  const [paintData, setPaintData] = useState({});
  const [selectedColor, setSelectedColor] = useState(PAINT_COLORS.WATER);
  const [brushSize, setBrushSize] = useState(1);
  const [eraserSize, setEraserSize] = useState(1);
  const [currentBrushType, setCurrentBrushType] = useState(BRUSH_TYPES.SQUARE);
  const [isLineMode, setIsLineMode] = useState(false);
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);
  const [lineStartPos, setLineStartPos] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stagePos, setStagePos] = useState(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return { x: width / 2, y: height / 2 };
  });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [lastPaintPos, setLastPaintPos] = useState(null);
  const [lastPointerPos, setLastPointerPos] = useState(null);
  const [isRightPressed, setIsRightPressed] = useState(false);
  const [draggedObject, setDraggedObject] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [step, setStep] = useState('upload'); // 'upload', 'crop', 'edit'
  const [uploadedImage, setUploadedImage] = useState(null);
  const stageRef = useRef();

  const addObject = (object) => {
    setObjects(prev => [...prev, { ...object, id: Date.now() }]);
  };

  const removeObject = (id) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
  };

  const updateObject = (id, updates) => {
    setObjects(prev => prev.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ));
  };

  const clearCanvas = () => {
    setObjects([]);
    setPaintData({});
    setBackgroundImage(null);
    setStep('upload');
  };

  return {
    currentTool,
    setCurrentTool,
    backgroundImage,
    setBackgroundImage,
    objects,
    setObjects,
    addObject,
    removeObject,
    updateObject,
    paintData,
    setPaintData,
    selectedColor,
    setSelectedColor,
    brushSize,
    setBrushSize,
    eraserSize,
    setEraserSize,
    currentBrushType,
    setCurrentBrushType,
    isLineMode,
    setIsLineMode,
    isEyedropperActive,
    setIsEyedropperActive,
    lineStartPos,
    setLineStartPos,
    isDragging,
    setIsDragging,
    stagePos,
    setStagePos,
    isSpacePressed,
    setIsSpacePressed,
    isShiftPressed,
    setIsShiftPressed,
    lastPaintPos,
    setLastPaintPos,
    lastPointerPos,
    setLastPointerPos,
    isRightPressed,
    setIsRightPressed,
    draggedObject,
    setDraggedObject,
    zoomLevel,
    setZoomLevel,
    step,
    setStep,
    uploadedImage,
    setUploadedImage,
    clearCanvas,
    stageRef
  };
};