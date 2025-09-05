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
      const width = window.innerWidth;
      const height = window.innerHeight;
      setCanvasSize({ width, height });
      
      const canvasWidth = width - 250;
      const maxCellSize = Math.min(canvasWidth / 7, height / 6) * 0.8;
      const newGridWidth = maxCellSize * 7;
      const newGridHeight = maxCellSize * 6;
      setGridWidth(newGridWidth);
      setGridHeight(newGridHeight);
      
      if (image) {
        const initialScale = Math.min(newGridWidth / image.width, newGridHeight / image.height);
        setImageTransform({
          x: (canvasWidth - image.width * initialScale) / 2,
          y: (height - image.height * initialScale) / 2,
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
    const gridX = (canvasSize.width - 250 - gridWidth) / 2;
    const gridY = (canvasSize.height - gridHeight) / 2;
    
    // 내부 세로선만 (테두리 제외)
    for (let i = 1; i < 7; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[gridX + i * cellWidth, gridY, gridX + i * cellWidth, gridY + gridHeight]}
          stroke="#4CAF50"
          strokeWidth={2}
        />
      );
    }
    
    // 내부 가로선만 (테두리 제외)
    for (let i = 1; i < 6; i++) {
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
    const centerX = (canvasSize.width - 250) / 2;
    const centerY = canvasSize.height / 2;
    
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
    
    const centerX = (canvasSize.width - 250) / 2;
    const centerY = canvasSize.height / 2;
    
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
    const gridX = (canvasSize.width - 250 - gridWidth) / 2;
    const gridY = (canvasSize.height - gridHeight) / 2;
    
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
      backgroundColor: '#f5f5f5',
      display: 'flex',
      zIndex: 2000
    }}>
      {/* 사이드바 */}
      <div style={{
        width: '250px',
        backgroundColor: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <h3 style={{ margin: 0 }}>지도 스크린샷 조정</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '12px', color: '#333', lineHeight: '1.4' }}>
            업로드된 이미지를 확대, 이동시켜 지도 스크린샷에 표시된 하얀색 점선과 초록색 격자선이 일치되도록 맞추세요.
          </div>
        </div>
        
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>조작 방법</h4>
          <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
            • 화살표 키: 미세 조정<br/>
            • 마우스 휠: 확대/축소
          </div>
        </div>
        
        <div>
          <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>확대 비율</label>
          <input
            type="number"
            min="0.1"
            max="5"
            step="0.01"
            value={Math.round(imageTransform.scaleX * 100) / 100}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value) || 1)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {Math.round(imageTransform.scaleX * 100)}%
          </div>
        </div>
        
        <button
          onClick={handleConfirm}
          style={{
            padding: '12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: 'auto'
          }}
        >
          확인
        </button>
      </div>
      
      {/* 메인 캔버스 영역 */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* X 버튼 */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '20px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
        
        <Stage
          width={canvasSize.width - 250}
          height={canvasSize.height}
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
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default ImageCropper;