import os
import boto3
from app.core.config import settings
from typing import Optional

class StorageService:
    """Handle file storage operations with S3-compatible services"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION
        )
        self.bucket = settings.S3_BUCKET
    
    def upload_file(self, file_path: str, s3_key: str) -> str:
        """Upload file to S3"""
        try:
            self.s3_client.upload_file(file_path, self.bucket, s3_key)
            return f"{settings.S3_ENDPOINT_URL}/{self.bucket}/{s3_key}"
        except Exception as e:
            raise Exception(f"Failed to upload file: {str(e)}")
    
    def download_file(self, s3_key: str, local_path: str) -> bool:
        """Download file from S3"""
        try:
            self.s3_client.download_file(self.bucket, s3_key, local_path)
            return True
        except Exception as e:
            raise Exception(f"Failed to download file: {str(e)}")
    
    def delete_file(self, s3_key: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket, Key=s3_key)
            return True
        except Exception as e:
            raise Exception(f"Failed to delete file: {str(e)}")
    
    def file_exists(self, s3_key: str) -> bool:
        """Check if file exists in S3"""
        try:
            self.s3_client.head_object(Bucket=self.bucket, Key=s3_key)
            return True
        except:
            return False

storage_service = StorageService()
