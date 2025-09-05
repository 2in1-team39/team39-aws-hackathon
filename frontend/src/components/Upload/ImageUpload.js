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
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '6px',
          padding: '15px',
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
            <p style={{ fontSize: '12px', color: '#666' }}>
            📷 지도 스크린샷 업로드            </p>
          </div>
        )}
      </div>
    </div>
  );
};
    
export default ImageUpload;