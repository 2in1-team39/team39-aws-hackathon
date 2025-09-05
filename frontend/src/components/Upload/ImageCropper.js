import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Line } from 'react-konva';
import { GRID_CONFIG } from '../../constants/gridConfig';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [imageTransform, setImageTransform] = useState({ x: 0, y: 0, scaleX: 1, scaleY: 1 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [gridWidth, setGridWidth] = useState(280);
  const [gridHeight, setGridHeight] = useState(240);
  const stageRef = useRef();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const moveStep = 1;
      switch (e.key) {
        case 'ArrowUp':
          setImageTransform(prev => ({ ...prev, y: prev.y - moveStep }));
          break;
        case 'ArrowDown':
          setImageTransform(prev => ({ ...prev, y: prev.y + moveStep }));
          break;
        case 'ArrowLeft':
          setImageTransform(prev => ({ ...prev, x: prev.x - moveStep }));
          break;
        case 'ArrowRight':
          setImageTransform(prev => ({ ...prev, x: prev.x + moveStep }));
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth - 40;
      const height = window.innerHeight - 120;
      setCanvasSize({ width, height });
      
      const maxCellSize = Math.min(width / 7, height / 6) * 0.8;
      const newGridWidth = maxCellSize * 7;
      const newGridHeight = maxCellSize * 6;
      setGridWidth(newGridWidth);
      setGridHeight(newGridHeight);
      
      if (image) {
        const initialScale = Math.min(newGridWidth / image.width, newGridHeight / image.height);
        setImageTransform({
          x: (width - image.width * initialScale) / 2,
          y: (height - 120 - image.height * initialScale) / 2,
          scaleX: initialScale,
          scaleY: initialScale
        });
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [image]);
  
  const drawGrid = () => {
    const lines = [];
    const cellWidth = gridWidth / 7; // 7열
    const cellHeight = gridHeight / 6; // 6행
    const gridX = (canvasSize.width - gridWidth) / 2;
    const gridY = (canvasSize.height - 120 - gridHeight) / 2;
    
    // 세로선 (7열)
    for (let i = 0; i <= 7; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[gridX + i * cellWidth, gridY, gridX + i * cellWidth, gridY + gridHeight]}
          stroke="#4CAF50"
          strokeWidth={2}
        />
      );
    }
    
    // 가로선 (6행)
    for (let i = 0; i <= 6; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[gridX, gridY + i * cellHeight, gridX + gridWidth, gridY + i * cellHeight]}
          stroke="#4CAF50"
          strokeWidth={2}
        />
      );
    }
    
    return lines;
  };

  const handleImageDrag = (e) => {
    setImageTransform(prev => ({
      ...prev,
      x: e.target.x(),
      y: e.target.y()
    }));
  };
  
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    
    const newScale = e.evt.deltaY > 0 
      ? imageTransform.scaleX / scaleBy 
      : imageTransform.scaleX * scaleBy;
    
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    
    // 가운데 기준 확대/축소
    const centerX = canvasSize.width / 2;
    const centerY = (canvasSize.height - 120) / 2;
    
    const scaleRatio = clampedScale / imageTransform.scaleX;
    const newX = centerX - (centerX - imageTransform.x) * scaleRatio;
    const newY = centerY - (centerY - imageTransform.y) * scaleRatio;
    
    setImageTransform({
      x: newX,
      y: newY,
      scaleX: clampedScale,
      scaleY: clampedScale
    });
  };
  
  const handleScaleChange = (newScale) => {
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    
    const centerX = canvasSize.width / 2;
    const centerY = (canvasSize.height - 120) / 2;
    
    const scaleRatio = clampedScale / imageTransform.scaleX;
    const newX = centerX - (centerX - imageTransform.x) * scaleRatio;
    const newY = centerY - (centerY - imageTransform.y) * scaleRatio;
    
    setImageTransform({
      x: newX,
      y: newY,
      scaleX: clampedScale,
      scaleY: clampedScale
    });
  };

  const handleConfirm = () => {
    const canvas = document.createElement('canvas');
    canvas.width = gridWidth;
    canvas.height = gridHeight;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    
    // 격자 영역 계산
    const gridX = (canvasSize.width - gridWidth) / 2;
    const gridY = (canvasSize.height - 120 - gridHeight) / 2;
    
    // 이미지에서 격자 영역에 해당하는 부분 추출
    const sourceX = (gridX - imageTransform.x) / imageTransform.scaleX;
    const sourceY = (gridY - imageTransform.y) / imageTransform.scaleY;
    const sourceWidth = gridWidth / imageTransform.scaleX;
    const sourceHeight = gridHeight / imageTransform.scaleY;
    
    ctx.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, gridWidth, gridHeight
    );
    
    const croppedImage = new Image();
    croppedImage.onload = () => onCropComplete(croppedImage);
    croppedImage.src = canvas.toDataURL();
  };



  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h2>지도 조정</h2>
        <p>7×6 격자에 맞춰 지도를 이동/확대/축소하세요</p>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
          • 드래그/화살표: 지도 이동 | 마우스 휠: 확대/축소
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          marginBottom: '10px',
          justifyContent: 'center'
        }}>
          <label style={{ fontSize: '14px' }}>확대 비율:</label>
          <input
            type="number"
            min="0.1"
            max="5"
            step="0.01"
            value={Math.round(imageTransform.scaleX * 100) / 100}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value) || 1)}
            style={{
              width: '80px',
              padding: '4px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              textAlign: 'center'
            }}
          />
          <span style={{ fontSize: '12px', color: '#666' }}>({Math.round(imageTransform.scaleX * 100)}%)</span>
        </div>
        
        <Stage
          width={canvasSize.width}
          height={canvasSize.height - 120}
          ref={stageRef}
          onWheel={handleWheel}
        >
          <Layer>
            <KonvaImage 
              image={image}
              x={imageTransform.x}
              y={imageTransform.y}
              scaleX={imageTransform.scaleX}
              scaleY={imageTransform.scaleY}
              draggable
              onDragMove={handleImageDrag}
            />
            {drawGrid()}
            <Rect
              x={(canvasSize.width - gridWidth) / 2}
              y={(canvasSize.height - 120 - gridHeight) / 2}
              width={gridWidth}
              height={gridHeight}
              stroke="#4CAF50"
              strokeWidth={3}
              fill="rgba(76, 175, 80, 0.1)"
            />
          </Layer>
        </Stage>
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={handleConfirm}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            확인
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;