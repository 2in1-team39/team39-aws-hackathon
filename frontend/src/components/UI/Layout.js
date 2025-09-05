import React from 'react';

const Layout = ({ children, sidebar }) => {
  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* 사이드바 */}
      <div style={{
        width: '200px',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        overflowY: 'auto',
        borderRight: '1px solid #dee2e6'
      }}>
        {sidebar}
      </div>
      
      {/* 메인 콘텐츠 */}
      <div style={{
        flex: 1,
        backgroundColor: '#ffffff',
        position: 'relative'
      }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;