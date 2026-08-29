import os
from minio import Minio
from minio.error import S3Error
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class MinIOClient:
    """MinIO client for local S3-compatible storage"""
    
    def __init__(self):
        # Parse MinIO endpoint
        endpoint = settings.S3_ENDPOINT_URL.replace("http://", "").replace("https://", "")
        
        self.client = Minio(
            endpoint,
            access_key=settings.S3_ACCESS_KEY or "minioadmin",
            secret_key=settings.S3_SECRET_KEY or "minioadmin",
            secure=False
        )
        self.bucket = settings.S3_BUCKET
    
    def ensure_bucket_exists(self) -> bool:
        """Create bucket if it doesn't exist"""
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
                logger.info(f"Created bucket: {self.bucket}")
            return True
        except S3Error as e:
            logger.error(f"Error ensuring bucket: {str(e)}")
            return False
    
    def upload_file(self, file_path: str, object_name: str) -> str:
        """Upload file to MinIO"""
        try:
            self.client.fput_object(
                self.bucket,
                object_name,
                file_path,
                content_type="video/mp4" if object_name.endswith(".mp4") else "audio/mpeg"
            )
            return f"{settings.S3_ENDPOINT_URL}/{self.bucket}/{object_name}"
        except S3Error as e:
            logger.error(f"Upload error: {str(e)}")
            raise
    
    def download_file(self, object_name: str, file_path: str) -> bool:
        """Download file from MinIO"""
        try:
            self.client.fget_object(self.bucket, object_name, file_path)
            return True
        except S3Error as e:
            logger.error(f"Download error: {str(e)}")
            return False
    
    def delete_file(self, object_name: str) -> bool:
        """Delete file from MinIO"""
        try:
            self.client.remove_object(self.bucket, object_name)
            return True
        except S3Error as e:
            logger.error(f"Delete error: {str(e)}")
            return False

minio_client = MinIOClient()
