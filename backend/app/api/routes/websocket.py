from fastapi import APIRouter, WebSocketException, WebSocket, Depends, status
import jwt
import logging

from app.core.config import settings
from app.websocket.manager import manager

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """WebSocket endpoint for real-time updates"""
    
    # Authenticate user
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
    except jwt.JWTError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # Connect and manage connection
    await manager.connect(websocket, str(user_id))
    
    try:
        while True:
            # Keep connection alive and receive messages if needed
            data = await websocket.receive_text()
            # Process incoming messages if needed
            logger.debug(f"Received message from user {user_id}: {data}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        await manager.disconnect(websocket, str(user_id))
