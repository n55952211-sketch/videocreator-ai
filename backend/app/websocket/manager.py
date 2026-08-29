import json
import logging
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manage WebSocket connections for real-time updates"""
    
    def __init__(self):
        # Map of user_id -> list of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Add a new WebSocket connection"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")
    
    async def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            
            logger.info(f"User {user_id} disconnected")
    
    async def broadcast_to_user(
        self,
        user_id: str,
        message: dict
    ):
        """Send message to all connections of a user"""
        if user_id not in self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections[user_id]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending WebSocket message: {str(e)}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            await self.disconnect(connection, user_id)
    
    async def send_export_update(
        self,
        user_id: str,
        export_id: str,
        status: str,
        progress: float = None,
        error: str = None,
        video_url: str = None
    ):
        """Send export progress update to user"""
        message = {
            "type": "export_update",
            "export_id": export_id,
            "status": status,
            "progress": progress,
            "error": error,
            "video_url": video_url,
        }
        await self.broadcast_to_user(user_id, message)
    
    async def send_voiceover_update(
        self,
        user_id: str,
        voiceover_id: str,
        status: str,
        audio_url: str = None,
        duration: float = None
    ):
        """Send voiceover generation update to user"""
        message = {
            "type": "voiceover_update",
            "voiceover_id": voiceover_id,
            "status": status,
            "audio_url": audio_url,
            "duration": duration,
        }
        await self.broadcast_to_user(user_id, message)

manager = ConnectionManager()
