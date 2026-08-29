import os
import subprocess
import logging
from typing import List, Dict, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class VideoService:
    """Handle video processing operations with FFmpeg"""
    
    @staticmethod
    def create_video(
        background_video: str,
        audio_file: str,
        captions: List[Dict],
        background_music: Optional[str] = None,
        output_file: str = "output.mp4",
        resolution: str = "1080p"
    ) -> bool:
        """
        Compose a complete video from components using FFmpeg.
        
        Args:
            background_video: Path to background video file
            audio_file: Path to voiceover audio file
            captions: List of caption dictionaries with timing and styling
            background_music: Optional path to background music
            output_file: Output video file path
            resolution: Output resolution (1080p, 720p, etc.)
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get video dimensions based on resolution
            width, height = VideoService._get_resolution_dimensions(resolution)
            
            # Build FFmpeg filter complex for captions
            caption_filter = VideoService._build_caption_filter(captions, width, height)
            
            # Build FFmpeg command
            cmd = [
                'ffmpeg',
                '-i', background_video,
                '-i', audio_file,
            ]
            
            # Add background music if provided
            if background_music and os.path.exists(background_music):
                cmd.extend(['-i', background_music])
                audio_filter = "[1:a][2:a]amix=inputs=2:duration=first[a]"
            else:
                audio_filter = "[1:a]anull[a]"
            
            # Scale and add captions
            filter_complex = f"[0:v]scale={width}:{height}{caption_filter}[v];{audio_filter}"
            
            cmd.extend([
                '-filter_complex', filter_complex,
                '-map', '[v]',
                '-map', '[a]',
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-preset', 'medium',
                '-crf', '23',
                '-shortest',
                output_file
            ])
            
            logger.info(f"Running FFmpeg command: {' '.join(cmd)}")
            
            # Execute FFmpeg
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=3600  # 1 hour timeout
            )
            
            if result.returncode != 0:
                error_msg = result.stderr.decode('utf-8', errors='ignore')
                logger.error(f"FFmpeg error: {error_msg}")
                return False
            
            logger.info(f"Video created successfully: {output_file}")
            return True
            
        except subprocess.TimeoutExpired:
            logger.error("FFmpeg processing timed out")
            return False
        except Exception as e:
            logger.error(f"Video creation failed: {str(e)}")
            return False
    
    @staticmethod
    def _get_resolution_dimensions(resolution: str) -> tuple:
        """Get width and height for resolution string"""
        resolutions = {
            "720p": (1280, 720),
            "1080p": (1920, 1080),
            "2160p": (3840, 2160),
            "vertical_short": (1080, 1920),  # For 9:16 short-form videos
        }
        return resolutions.get(resolution, (1920, 1080))
    
    @staticmethod
    def _build_caption_filter(captions: List[Dict], width: int, height: int) -> str:
        """
        Build FFmpeg drawtext filter for captions with animations.
        
        Args:
            captions: List of caption objects
            width: Video width
            height: Video height
        
        Returns:
            FFmpeg filter string for captions
        """
        if not captions:
            return ""
        
        filter_parts = []
        
        for i, caption in enumerate(captions):
            # Position calculations
            position_map = {
                "top": f"y=(h-th)*0.1",
                "middle": f"y=(h-th)/2",
                "bottom": f"y=h-th-10",
            }
            
            y_pos = position_map.get(caption.get("position", "bottom"), "y=h-th-10")
            
            # Build drawtext filter
            drawtext = (
                f"drawtext="
                f"textfile=:text='{caption['text']}':"
                f"fontsize={caption.get('font_size', 24)}:"
                f"fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:"
                f"fontcolor=white:"
                f"bordercolor=black:"
                f"borderw=2:"
                f"enable='between(t,{caption['start_time']},{caption['end_time']})':"
                f"x=(w-text_w)/2:"
                f"{y_pos}"
            )
            
            filter_parts.append(f"[{i}]{drawtext}" if i > 0 else drawtext)
        
        return ",".join(filter_parts) if filter_parts else ""
    
    @staticmethod
    def get_video_duration(video_file: str) -> Optional[float]:
        """Get video duration in seconds"""
        try:
            cmd = [
                'ffprobe',
                '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1:nokey=1',
                video_file
            ]
            
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if result.returncode == 0:
                return float(result.stdout.decode('utf-8').strip())
        except Exception as e:
            logger.error(f"Failed to get video duration: {str(e)}")
        
        return None
    
    @staticmethod
    def get_file_size(file_path: str) -> int:
        """Get file size in bytes"""
        try:
            return os.path.getsize(file_path)
        except Exception as e:
            logger.error(f"Failed to get file size: {str(e)}")
            return 0
