from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import os
from datetime import datetime
from typing import List, Dict, Any

app = FastAPI(title="Animal Crossing Island Designer API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 프로젝트 저장 디렉토리
PROJECTS_DIR = "projects"
os.makedirs(PROJECTS_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Animal Crossing Island Designer API"}

@app.post("/api/projects/save")
async def save_project(project_data: Dict[str, Any]):
    """프로젝트 데이터 저장"""
    try:
        project_id = f"project_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        file_path = os.path.join(PROJECTS_DIR, f"{project_id}.json")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(project_data, f, ensure_ascii=False, indent=2)
        
        return {"project_id": project_id, "message": "프로젝트가 저장되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}")
async def load_project(project_id: str):
    """프로젝트 데이터 불러오기"""
    try:
        file_path = os.path.join(PROJECTS_DIR, f"{project_id}.json")
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            project_data = json.load(f)
        
        return project_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects")
async def list_projects():
    """저장된 프로젝트 목록"""
    try:
        projects = []
        for filename in os.listdir(PROJECTS_DIR):
            if filename.endswith('.json'):
                project_id = filename[:-5]  # .json 제거
                file_path = os.path.join(PROJECTS_DIR, filename)
                
                # 파일 정보 가져오기
                stat = os.stat(file_path)
                created_at = datetime.fromtimestamp(stat.st_ctime)
                
                projects.append({
                    "project_id": project_id,
                    "created_at": created_at.isoformat(),
                    "file_size": stat.st_size
                })
        
        # 생성일 기준 내림차순 정렬
        projects.sort(key=lambda x: x['created_at'], reverse=True)
        
        return {"projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload/image")
async def upload_image(file: UploadFile = File(...)):
    """이미지 업로드 (향후 S3 연동 예정)"""
    try:
        # 파일 형식 검증
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
        
        # 임시로 로컬에 저장 (실제로는 S3에 업로드)
        uploads_dir = "uploads"
        os.makedirs(uploads_dir, exist_ok=True)
        
        file_path = os.path.join(uploads_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {
            "filename": file.filename,
            "url": f"/uploads/{file.filename}",
            "message": "이미지가 업로드되었습니다."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)