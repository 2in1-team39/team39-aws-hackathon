import boto3
import base64
import json
import os
from PIL import Image
import io
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class BedrockService:
    def __init__(self):
        self.bedrock = boto3.client(
            'bedrock-runtime',
            region_name=os.getenv('BEDROCK_REGION', 'us-east-1'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        
    async def generate_pixel_art(self, image_data: bytes) -> Optional[bytes]:
        """이미지를 Bedrock으로 도트 아트로 변환 (여러 모델 시도)"""
        print(f"Bedrock 이미지 처리 시작, 크기: {len(image_data)} bytes")
        
        # 시도할 모델 목록 (실제 사용 가능한 모델 ID)
        models = [
            "stability.stable-diffusion-xl-v1",
            "amazon.titan-image-generator-v1",
            "anthropic.claude-3-haiku-20240307-v1:0"
        ]
        
        for model_id in models:
            try:
                print(f"{model_id} 모델 시도 중...")
                result = await self._try_bedrock_model(image_data, model_id)
                if result:
                    return result
            except Exception as e:
                print(f"{model_id} 실패: {e}")
                continue
        
        # 모든 Bedrock 모델 실패 시 로컬 처리
        print("모든 Bedrock 모델 실패, 로컬 처리로 대체")
        return self._process_to_pixel_art_local(image_data)
    
    async def _try_bedrock_model(self, image_data: bytes, model_id: str) -> Optional[bytes]:
        """특정 Bedrock 모델로 시도"""
        # 이미지를 64의 배수로 리사이즈
        processed_image_data = self._resize_for_bedrock(image_data)
        image_b64 = base64.b64encode(processed_image_data).decode()
        
        if "stability" in model_id:
            # Stable Diffusion 모델
            body = {
                "text_prompts": [
                    {
                        "text": "pixel art, 8-bit retro game style, simple flat colors, minimalist design, animal crossing style, cute cartoon",
                        "weight": 1.0
                    }
                ],
                "init_image": image_b64,
                "init_image_mode": "IMAGE_STRENGTH",
                "image_strength": 0.7,
                "cfg_scale": 10,
                "steps": 30,
                "width": 512,
                "height": 512
            }
        elif "titan" in model_id:
            # Titan 모델
            body = {
                "taskType": "IMAGE_VARIATION",
                "imageVariationParams": {
                    "text": "pixel art, 8-bit style, animal crossing style, simple colors",
                    "images": [image_b64]
                },
                "imageGenerationConfig": {
                    "numberOfImages": 1,
                    "width": 512,
                    "height": 512
                }
            }
        else:
            # Claude 모델 - 텍스트 기반 도트 아트 설명 생성
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": image_b64
                                }
                            },
                            {
                                "type": "text",
                                "text": "이 이미지를 동물의 숲 스타일의 32x32 도트 아트로 변환해주세요. 단순한 색상과 깨끗한 픽셀 아트 스타일로 만들어주세요."
                            }
                        ]
                    }
                ]
            }
            # Claude는 이미지 생성이 아닌 텍스트 응답만 제공하므로 로컬 처리로 대체
            print(f"{model_id}는 이미지 생성 모델이 아님, 로컬 처리로 대체")
            return self._process_to_pixel_art_local(self._resize_for_bedrock(image_data))
        
        response = self.bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps(body)
        )
        
        response_body = json.loads(response['body'].read())
        
        if "stability" in model_id:
            generated_image_b64 = response_body['artifacts'][0]['base64']
        elif "titan" in model_id:
            generated_image_b64 = response_body['images'][0]
        else:
            # Claude는 이미지 생성 모델이 아님
            return None
        
        generated_image_data = base64.b64decode(generated_image_b64)
        print(f"{model_id} 성공: {len(generated_image_data)} bytes")
        
        return self._process_to_pixel_art(generated_image_data)
    
    def _resize_for_bedrock(self, image_data: bytes) -> bytes:
        """이미지를 Bedrock 요구사항에 맞게 리사이즈 (64의 배수)"""
        image = Image.open(io.BytesIO(image_data))
        
        # RGB로 변환
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # 64의 배수로 리사이즈 (512x512)
        resized_image = image.resize((512, 512), Image.LANCZOS)
        
        # 바이트로 변환
        output = io.BytesIO()
        resized_image.save(output, format='JPEG', quality=95)
        return output.getvalue()
    
    def _process_to_pixel_art_local(self, image_data: bytes) -> bytes:
        """로컬에서 도트 아트 변환 (Bedrock 대체)"""
        print("로컬 도트 아트 변환 시작")
        
        # 이미지 로드 및 처리
        image = Image.open(io.BytesIO(image_data))
        
        # RGB로 변환
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # 32x32로 리사이즈
        pixel_art = image.resize((32, 32), Image.NEAREST)
        
        # 16색으로 단순화
        pixel_art = pixel_art.quantize(colors=16, method=Image.MEDIANCUT)
        pixel_art = pixel_art.convert('RGB')
        
        # PNG로 저장
        output = io.BytesIO()
        pixel_art.save(output, format='PNG')
        result = output.getvalue()
        
        print(f"로컬 처리 완료: {len(result)} bytes")
        return result
    
    def _process_to_pixel_art(self, image_data: bytes) -> bytes:
        """생성된 이미지를 32x32 도트 아트로 후처리"""
        try:
            # 이미지 로드
            image = Image.open(io.BytesIO(image_data))
            print(f"원본 이미지 크기: {image.size}")
            
            # RGB로 변환
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # 32x32로 리사이즈 (픽셀화 효과)
            pixel_art = image.resize((32, 32), Image.NEAREST)
            
            # 색상 단순화 (16색)
            pixel_art = pixel_art.quantize(colors=16, method=Image.MEDIANCUT)
            pixel_art = pixel_art.convert('RGB')
            
            print("32x32 도트 아트 변환 완료")
            
            # PNG로 저장
            output = io.BytesIO()
            pixel_art.save(output, format='PNG')
            result = output.getvalue()
            
            print(f"최종 결과: {len(result)} bytes")
            return result
            
        except Exception as e:
            print(f"후처리 오류: {e}")
            raise