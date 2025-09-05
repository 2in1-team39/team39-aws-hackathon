# 기술 스택 및 아키텍처 설계

## 1. 기술 스택 선정

### 1.1 프론트엔드
```
React (JavaScript)
├── Konva.js - 캔버스 조작 및 렌더링
├── React-Dropzone - 파일 업로드
├── Tailwind CSS - 스타일링
└── React-Konva - React와 Konva 연동
```

### 1.2 백엔드 (선택사항)
```
Python FastAPI
├── Pillow - 이미지 처리
├── Boto3 - AWS S3 연동
├── Uvicorn - ASGI 서버
└── Pydantic - 데이터 검증
```

### 1.3 AWS 인프라
```
AWS Services
├── Amplify - 프론트엔드 호스팅
├── Lambda - 서버리스 백엔드
├── API Gateway - REST API
├── S3 - 파일 저장소
└── CloudFront - CDN
```

## 2. 시스템 아키텍처

### 2.1 전체 아키텍처
```
[사용자] → [CloudFront] → [Amplify (React App)]
                              ↓
                         [API Gateway] → [Lambda (FastAPI)]
                              ↓
                         [S3 Bucket (이미지 저장)]
```

### 2.2 프론트엔드 아키텍처
```
src/
├── components/
│   ├── Canvas/
│   │   ├── IslandCanvas.js - 메인 캔버스 컴포넌트
│   │   ├── GridSystem.js - 격자 시스템
│   │   └── ObjectLayer.js - 오브젝트 레이어
│   ├── Tools/
│   │   ├── ToolPanel.js - 도구 패널
│   │   ├── ObjectPalette.js - 오브젝트 팔레트
│   │   └── PaintTools.js - 페인트 도구
│   ├── Upload/
│   │   └── ImageUpload.js - 이미지 업로드
│   └── UI/
│       ├── Layout.js - 메인 레이아웃
│       └── PropertyPanel.js - 속성 패널
├── hooks/
│   ├── useCanvas.js - 캔버스 상태 관리
│   ├── useGrid.js - 격자 시스템 훅
│   └── useObjects.js - 오브젝트 관리 훅
├── utils/
│   ├── gridUtils.js - 격자 계산 유틸리티
│   ├── imageUtils.js - 이미지 처리 유틸리티
│   └── canvasUtils.js - 캔버스 유틸리티
└── constants/
    ├── gridConfig.js - 격자 설정
    └── objectTypes.js - 오브젝트 타입 정의
```

## 3. 핵심 컴포넌트 설계

### 3.1 격자 시스템 (GridSystem.js)
```javascript
const GRID_CONFIG = {
  COLS: 7,
  ROWS: 6,
  CELL_SIZE: 16,
  CANVAS_WIDTH: 112, // 7 * 16
  CANVAS_HEIGHT: 96  // 6 * 16
};

class GridSystem {
  // 픽셀 좌표를 격자 좌표로 변환
  pixelToGrid(x, y)
  
  // 격자 좌표를 픽셀 좌표로 변환
  gridToPixel(gridX, gridY)
  
  // 격자에 스냅
  snapToGrid(x, y)
  
  // 격자 가이드라인 그리기
  drawGrid(layer)
}
```

### 3.2 오브젝트 관리 (ObjectManager.js)
```javascript
class ObjectManager {
  // 오브젝트 배치
  placeObject(type, gridX, gridY)
  
  // 오브젝트 이동
  moveObject(id, newGridX, newGridY)
  
  // 오브젝트 삭제
  removeObject(id)
  
  // 충돌 검사
  checkCollision(gridX, gridY, width, height)
}
```

### 3.3 페인트 시스템 (PaintSystem.js)
```javascript
class PaintSystem {
  // 브러시로 그리기
  paint(x, y, color, brushSize)
  
  // 지우개
  erase(x, y, brushSize)
  
  // 채우기 (Flood Fill)
  floodFill(x, y, color)
  
  // 실행 취소/다시 실행
  undo() / redo()
}
```

## 4. 데이터 구조

### 4.1 격자 데이터
```javascript
const gridData = {
  width: 7,
  height: 6,
  cells: Array(7 * 6).fill(null), // 각 셀의 상태
  backgroundImage: null
};
```

### 4.2 오브젝트 데이터
```javascript
const objectData = {
  id: 'unique-id',
  type: 'tree', // 'building', 'decoration', etc.
  gridX: 3,
  gridY: 2,
  width: 1,  // 격자 단위
  height: 1,
  rotation: 0, // 0, 90, 180, 270
  properties: {} // 오브젝트별 추가 속성
};
```

### 4.3 페인트 데이터
```javascript
const paintData = {
  pixels: new Uint8ClampedArray(112 * 96 * 4), // RGBA
  layers: [
    { name: 'roads', visible: true, opacity: 1.0 },
    { name: 'rivers', visible: true, opacity: 0.8 }
  ]
};
```

## 5. 성능 최적화 전략

### 5.1 캔버스 최적화
- **레이어 분리**: 배경, 격자, 오브젝트, UI를 별도 레이어로 관리
- **더티 렉트**: 변경된 영역만 다시 그리기
- **오브젝트 풀링**: 자주 생성/삭제되는 오브젝트 재사용

### 5.2 메모리 최적화
- **이미지 캐싱**: 동일한 오브젝트 스프라이트 재사용
- **가비지 컬렉션**: 불필요한 객체 참조 제거
- **지연 로딩**: 필요한 시점에 리소스 로드

### 5.3 사용자 경험 최적화
- **프리로딩**: 자주 사용되는 리소스 미리 로드
- **디바운싱**: 연속적인 이벤트 처리 최적화
- **가상화**: 대량의 오브젝트 처리 시 뷰포트 기반 렌더링

## 6. 보안 고려사항

### 6.1 클라이언트 사이드
- 파일 업로드 크기 및 형식 검증
- XSS 방지를 위한 입력 검증
- CSRF 토큰 사용

### 6.2 서버 사이드
- 이미지 파일 헤더 검증
- 업로드 속도 제한 (Rate Limiting)
- S3 버킷 권한 최소화

## 7. 확장성 고려사항

### 7.1 기능 확장
- 플러그인 시스템으로 새로운 도구 추가
- 커스텀 오브젝트 업로드 기능
- 협업 기능을 위한 실시간 동기화

### 7.2 인프라 확장
- CDN을 통한 글로벌 서비스
- 오토 스케일링으로 트래픽 대응
- 데이터베이스 도입으로 사용자 데이터 관리
