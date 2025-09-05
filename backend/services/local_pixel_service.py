from PIL import Image, ImageFilter
import io
from typing import Optional

class LocalPixelService:
    """Bedrock 대신 로컬에서 도트 아트 생성"""
    
    def generate_pixel_art(self, image_data: bytes) -> Optional[bytes]:
        """이미지를 32x32 도트 아트로 변환 (로컬 처리)"""
        try:
            # 이미지 로드
            image = Image.open(io.BytesIO(image_data))
            
            # RGB로 변환
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # 32x32로 리사이즈 (픽셀화 효과)
            pixel_art = image.resize((32, 32), Image.NEAREST)
            
            # 색상 단순화 (16색)
            pixel_art = pixel_art.quantize(colors=16, method=Image.MEDIANCUT)
            
            # 다시 RGB로 변환
            pixel_art = pixel_art.convert('RGB')
            
            # 바이트로 변환
            output = io.BytesIO()
            pixel_art.save(output, format='PNG')
            return output.getvalue()
            
        except Exception as e:
            print(f"로컬 픽셀 아트 생성 오류: {e}")
            return None