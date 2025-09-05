# 모여봐요 동물의 숲 섬 꾸미기 도구

동물의 숲 섬 지도 스크린샷을 기반으로 한 격자 기반 섬 꾸미기 웹 어플리케이션

## 주요 기능

- 🗺️ 섬 지도 이미지 업로드 및 배경 설정
- 📐 7×6 격자 시스템 (각 칸 16×16 픽셀)
- 🎨 격자 단위 페인트 기능 (도로, 강줄기 등)
- 🏠 오브젝트 배치 및 관리
- 🔍 피그마 스타일 확대/축소 및 팬 기능
- 💾 프로젝트 저장/불러오기

## 기술 스택

- **Frontend**: React + JavaScript + Konva.js
- **Backend**: Python FastAPI
- **배포**: AWS (S3 + CloudFront + Lambda)

## 설치 및 실행

### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 프로젝트 구조

```
q_hackathon/
├── frontend/           # React 프론트엔드
├── backend/           # FastAPI 백엔드
├── docs/              # 프로젝트 문서
└── deployment/        # AWS 배포 설정
```

## 개발 진행 상황

- [ ] Phase 1: 기본 캔버스 설정
- [ ] Phase 2: 이미지 업로드 및 배경 설정
- [ ] Phase 3: 오브젝트 시스템
- [ ] Phase 4: 페인트 시스템
- [ ] Phase 5: UI/UX 개선
- [ ] Phase 6: 백엔드 및 저장 기능
- [ ] Phase 7: AWS 배포
- [ ] Phase 8: 테스트 및 최적화