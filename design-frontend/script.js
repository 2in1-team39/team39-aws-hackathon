// 동물의 숲 색상 팔레트
const ANIMAL_CROSSING_COLORS = [
    '#FFFFFF', '#FFCCCC', '#FF9999', '#FF6666', '#FF3333', '#FF0000',
    '#CCFFCC', '#99FF99', '#66FF66', '#33FF33', '#00FF00', '#00CC00',
    '#CCCCFF', '#9999FF', '#6666FF', '#3333FF', '#0000FF', '#0000CC',
    '#FFFFCC', '#FFFF99', '#FFFF66', '#FFFF33', '#FFFF00', '#CCCC00',
    '#FFCCFF', '#FF99FF', '#FF66FF', '#FF33FF', '#FF00FF', '#CC00CC',
    '#CCFFFF', '#99FFFF', '#66FFFF', '#33FFFF', '#00FFFF', '#00CCCC',
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#F0F0F0'
];

let canvas, ctx;
let selectedColor = '#FF0000';
let isDrawing = false;
let pixelGrid = Array(32).fill().map(() => Array(32).fill('#FFFFFF'));

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('pixelCanvas');
    ctx = canvas.getContext('2d');
    
    setupCanvas();
    setupColorPalette();
    setupFileUpload();
    drawGrid();
});

function setupCanvas() {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
}

function setupColorPalette() {
    const palette = document.getElementById('colorPalette');
    
    ANIMAL_CROSSING_COLORS.forEach(color => {
        const colorCell = document.createElement('div');
        colorCell.className = 'color-cell';
        colorCell.style.backgroundColor = color;
        colorCell.onclick = () => selectColor(color, colorCell);
        palette.appendChild(colorCell);
    });
    
    // 첫 번째 색상 선택
    palette.firstChild.classList.add('selected');
}

function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileUpload);
}

function selectColor(color, element) {
    selectedColor = color;
    document.querySelectorAll('.color-cell').forEach(cell => {
        cell.classList.remove('selected');
    });
    element.classList.add('selected');
}

function getPixelPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / 12);
    const y = Math.floor((event.clientY - rect.top) / 12);
    return { x: Math.min(x, 31), y: Math.min(y, 31) };
}

function startDrawing(event) {
    isDrawing = true;
    draw(event);
}

function draw(event) {
    if (!isDrawing) return;
    
    const pos = getPixelPosition(event);
    pixelGrid[pos.y][pos.x] = selectedColor;
    drawPixel(pos.x, pos.y, selectedColor);
}

function stopDrawing() {
    isDrawing = false;
}

function drawPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * 12, y * 12, 12, 12);
    
    // 격자 선 그리기
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x * 12, y * 12, 12, 12);
}

function drawGrid() {
    // 배경 흰색으로 채우기
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 격자 그리기
    for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
            drawPixel(x, y, pixelGrid[y][x]);
        }
    }
}

function clearCanvas() {
    pixelGrid = Array(32).fill().map(() => Array(32).fill('#FFFFFF'));
    drawGrid();
}

function exportDesign() {
    const link = document.createElement('a');
    link.download = 'my-design.png';
    link.href = canvas.toDataURL();
    link.click();
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const uploadText = document.getElementById('uploadText');
    uploadText.innerHTML = '<p class="loading">🔄 AI가 도트 아트를 생성 중...</p>';
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('http://localhost:8000/api/design/generate-pixel-art', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('도트 아트 생성 실패');
        }
        
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        // AI 결과 표시
        const aiResult = document.getElementById('aiResult');
        const aiImage = document.getElementById('aiImage');
        aiImage.src = imageUrl;
        aiResult.style.display = 'block';
        
        uploadText.innerHTML = '<p>✅ AI 도트 아트 생성 완료!</p><p style="font-size: 12px;">참고하여 에디터에서 편집하세요</p>';
        
    } catch (error) {
        uploadText.innerHTML = '<p style="color: red;">❌ ' + error.message + '</p>';
    }
}