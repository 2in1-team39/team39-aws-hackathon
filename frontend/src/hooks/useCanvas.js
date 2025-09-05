import { useState, useRef } from 'react';
import { TOOLS } from '../constants/objectTypes';

export const useCanvas = () => {
  const [currentTool, setCurrentTool] = useState(TOOLS.SELECT);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [objects, setObjects] = useState([]);
  const [paintData, setPaintData] = useState({});
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
  };

  return {
    currentTool,
    setCurrentTool,
    backgroundImage,
    setBackgroundImage,
    objects,
    addObject,
    removeObject,
    updateObject,
    paintData,
    setPaintData,
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