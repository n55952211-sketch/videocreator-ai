import os
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.export import Export
from app.models.project import Project
from app.models.voiceover import Voiceover, Caption
from app.services.video import VideoService
from app.services.storage import storage_service
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3)
def render_video_task(self, export_id: str):
    """
    Background task to render and export video.
    
    Args:
        export_id: ID of the export record
    """
    db = SessionLocal()
    try:
        # Get export and related data
        export = db.query(Export).filter(Export.id == export_id).first()
        if not export:
            logger.error(f"Export {export_id} not found")
            return {"status": "failed", "error": "Export not found"}
        
        project = db.query(Project).filter(Project.id == export.project_id).first()
        if not project:
            logger.error(f"Project {export.project_id} not found")
            export.status = "failed"
            export.error_message = "Project not found"
            db.commit()
            return {"status": "failed", "error": "Project not found"}
        
        # Update status to processing
        export.status = "processing"
        db.commit()
        
        logger.info(f"Starting render for export {export_id}")
        
        # Get voiceover with captions
        voiceover = db.query(Voiceover).filter(
            Voiceover.project_id == export.project_id
        ).first()
        
        if not voiceover or not voiceover.audio_url:
            raise Exception("No voiceover found or audio not generated")
        
        # Get captions
        captions = db.query(Caption).filter(
            Caption.voiceover_id == voiceover.id
        ).all()
        
        # Prepare file paths
        temp_dir = os.path.join(settings.MEDIA_DIR, export.project_id)
        os.makedirs(temp_dir, exist_ok=True)
        
        # Download audio file
        audio_path = os.path.join(temp_dir, "audio.mp3")
        if voiceover.audio_url.startswith("http"):
            # Download from S3
            storage_service.download_file(voiceover.audio_url.split("/")[-1], audio_path)
        else:
            audio_path = voiceover.audio_url
        
        # TODO: Get background video and music from project
        # For now, use placeholder
        background_video = os.path.join(temp_dir, "background.mp4")
        
        if not os.path.exists(background_video):
            # Create a placeholder video or use default
            logger.warning(f"Background video not found: {background_video}")
            raise Exception("Background video not found")
        
        # Prepare caption data
        caption_data = [
            {
                "text": caption.text,
                "start_time": caption.start_time,
                "end_time": caption.end_time,
                "position": caption.position,
                "font_size": caption.font_size,
                "animation": caption.animation,
            }
            for caption in captions
        ]
        
        # Output file path
        output_file = os.path.join(temp_dir, "output.mp4")
        
        # Create video
        logger.info(f"Creating video: {output_file}")
        success = VideoService.create_video(
            background_video=background_video,
            audio_file=audio_path,
            captions=caption_data,
            output_file=output_file,
            resolution=export.resolution
        )
        
        if not success:
            raise Exception("Video creation failed")
        
        # Get file info
        file_size = VideoService.get_file_size(output_file)
        duration = VideoService.get_video_duration(output_file)
        
        # Upload to S3
        s3_key = f"exports/{export.project_id}/{export.id}/video.mp4"
        logger.info(f"Uploading video to S3: {s3_key}")
        video_url = storage_service.upload_file(output_file, s3_key)
        
        # Update export record
        export.status = "completed"
        export.video_url = video_url
        export.file_size = file_size
        export.duration = duration
        export.updated_at = datetime.utcnow()
        db.commit()
        
        # Clean up temp files
        if os.path.exists(output_file):
            os.remove(output_file)
        
        logger.info(f"Export {export_id} completed successfully")
        return {"status": "completed", "video_url": video_url}
        
    except Exception as e:
        logger.error(f"Export task failed: {str(e)}")
        export.status = "failed"
        export.error_message = str(e)
        export.updated_at = datetime.utcnow()
        db.commit()
        
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
    
    finally:
        db.close()
