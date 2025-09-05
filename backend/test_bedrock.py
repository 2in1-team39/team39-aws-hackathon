import boto3
import os
from dotenv import load_dotenv

load_dotenv()

def test_bedrock_connection():
    """Bedrock 연결 테스트"""
    try:
        bedrock = boto3.client(
            'bedrock-runtime',
            region_name=os.getenv('BEDROCK_REGION', 'us-east-1'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        
        # 사용 가능한 모델 목록 확인
        bedrock_models = boto3.client(
            'bedrock',
            region_name=os.getenv('BEDROCK_REGION', 'us-east-1'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        
        response = bedrock_models.list_foundation_models()
        print("✅ Bedrock 연결 성공!")
        print(f"사용 가능한 모델 수: {len(response['modelSummaries'])}")
        
        # Stable Diffusion 모델 확인
        for model in response['modelSummaries']:
            if 'stability' in model['modelId'].lower():
                print(f"📸 {model['modelId']} - {model['modelName']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Bedrock 연결 실패: {e}")
        return False

if __name__ == "__main__":
    test_bedrock_connection()