import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const PixelArtGenerator = ({ onPixelArtGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: handleImageUpload
  });

  async function handleImageUpload(files) {
    if (files.length === 0) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      
      const response = await fetch('http://localhost:8000/api/design/generate-pixel-art', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('도트 아트 생성 실패');
      }
      
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      onPixelArtGenerated(imageUrl);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>🎨 마이디자인 생성기</h3>
      
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa'
        }}
      >
        <input {...getInputProps()} />
        {isGenerating ? (
          <div>
            <div>🔄 AI가 도트 아트를 생성 중...</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              약 30초 정도 소요됩니다
            </div>
          </div>
        ) : (
          <div>
            <div>📸 이미지를 드래그하거나 클릭하여 업로드</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              AI가 32×32 도트 아트로 변환합니다
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
};

export default PixelArtGenerator;