import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageUpload = ({ onImageUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          onImageUpload(img);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false
  });

  return (
    <div style={{ 
      padding: '10px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px',
      marginBottom: '10px'
    }}>
      <h3>배경 이미지</h3>
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? '#e8f5e8' : 'white'
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>이미지를 여기에 놓으세요...</p>
        ) : (
          <div>
            <p>📷 섬 지도 이미지를 업로드하세요</p>
            <p style={{ fontSize: '12px', color: '#666' }}>
              클릭하거나 드래그해서 업로드
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;