from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response, HTMLResponse
from services.bedrock_service import BedrockService

router = APIRouter(prefix="/api/design", tags=["design"])
bedrock_service = BedrockService()

@router.get("/app", response_class=HTMLResponse)
async def design_app():
    """마이디자인 앱 페이지"""
    html_content = '''
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>🎨 동물의 숲 마이디자인</title>
    <style>
        body { font-family: Arial; background: #f0f8ff; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .main { display: flex; gap: 30px; }
        .upload { flex: 1; background: white; padding: 20px; border-radius: 10px; }
        .editor { flex: 2; background: white; padding: 20px; border-radius: 10px; }
        .upload-area { border: 3px dashed #4CAF50; padding: 40px; text-align: center; cursor: pointer; }
        .canvas { border: 2px solid #333; cursor: crosshair; }
        .palette { display: grid; grid-template-columns: repeat(6, 30px); gap: 5px; }
        .color { width: 30px; height: 30px; border: 2px solid #ccc; cursor: pointer; }
        .btn { padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 동물의 숲 마이디자인 생성기</h1>
        </div>
        <div class="main">
            <div class="upload">
                <h3>📸 이미지 업로드</h3>
                <div class="upload-area" onclick="document.getElementById('file').click()">
                    <input type="file" id="file" accept="image/*" style="display:none">
                    <p>이미지를 클릭하여 업로드</p>
                </div>
                <div id="result" style="margin-top:20px; display:none">
                    <img id="aiImg" style="width:100%; max-width:200px; image-rendering:pixelated">
                </div>
            </div>
            <div class="editor">
                <h3>✏️ 32×32 에디터</h3>
                <canvas id="canvas" width="384" height="384" class="canvas"></canvas>
                <div>
                    <button class="btn" onclick="clear()">🗑️ 지우기</button>
                    <button class="btn" onclick="save()">💾 저장</button>
                </div>
                <div class="palette" id="palette"></div>
            </div>
        </div>
    </div>
    <script>
        const colors = ['#FFFFFF','#FF0000','#00FF00','#0000FF','#FFFF00','#FF00FF','#00FFFF','#000000'];
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        let selectedColor = '#FF0000';
        let grid = Array(32).fill().map(() => Array(32).fill('#FFFFFF'));
        
        // 팔레트 생성
        colors.forEach(color => {
            let div = document.createElement('div');
            div.className = 'color';
            div.style.backgroundColor = color;
            div.onclick = () => selectedColor = color;
            document.getElementById('palette').appendChild(div);
        });
        
        // 캔버스 그리기
        function drawGrid() {
            for(let y=0; y<32; y++) {
                for(let x=0; x<32; x++) {
                    ctx.fillStyle = grid[y][x];
                    ctx.fillRect(x*12, y*12, 12, 12);
                    ctx.strokeRect(x*12, y*12, 12, 12);
                }
            }
        }
        
        canvas.onclick = (e) => {
            let rect = canvas.getBoundingClientRect();
            let x = Math.floor((e.clientX - rect.left) / 12);
            let y = Math.floor((e.clientY - rect.top) / 12);
            if(x < 32 && y < 32) {
                grid[y][x] = selectedColor;
                drawGrid();
            }
        };
        
        function clear() {
            grid = Array(32).fill().map(() => Array(32).fill('#FFFFFF'));
            drawGrid();
        }
        
        function save() {
            let link = document.createElement('a');
            link.download = 'design.png';
            link.href = canvas.toDataURL();
            link.click();
        }
        
        // 파일 업로드
        document.getElementById('file').onchange = async (e) => {
            let formData = new FormData();
            formData.append('file', e.target.files[0]);
            
            try {
                let response = await fetch('/api/design/generate-pixel-art', {
                    method: 'POST',
                    body: formData
                });
                
                if(response.ok) {
                    let blob = await response.blob();
                    let url = URL.createObjectURL(blob);
                    document.getElementById('aiImg').src = url;
                    document.getElementById('result').style.display = 'block';
                }
            } catch(error) {
                alert('업로드 실패: ' + error.message);
            }
        };
        
        drawGrid();
    </script>
</body>
</html>
    '''
    return HTMLResponse(content=html_content)


@router.post("/generate-pixel-art")
async def generate_pixel_art(file: UploadFile = File(...)):
    """이미지를 도트 아트로 변환"""
    print(f"파일 업로드: {file.filename}, 타입: {file.content_type}")
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
    
    try:
        image_data = await file.read()
        print(f"이미지 데이터 읽기 완료: {len(image_data)} bytes")
        
        pixel_art_data = await bedrock_service.generate_pixel_art(image_data)
        
        if not pixel_art_data:
            print("도트 아트 생성 실패")
            raise HTTPException(status_code=500, detail="도트 아트 생성에 실패했습니다.")
        
        print(f"도트 아트 생성 성공: {len(pixel_art_data)} bytes")
        
        return Response(
            content=pixel_art_data,
            media_type="image/png"
        )
    except Exception as e:
        print(f"오류 발생: {e}")
        raise HTTPException(status_code=500, detail=str(e))