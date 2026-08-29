from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.export import Export
from app.schemas.export import ExportCreate, ExportResponse
from app.api.dependencies import get_current_user

router = APIRouter()

# Helper function to verify authorization
async def verify_export_access(export_id: str, current_user: User, db: Session):
    """Verify that current user has access to this export"""
    export = db.query(Export).join(Project).filter(
        Export.id == export_id,
        Project.user_id == current_user.id
    ).first()
    
    if not export:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    return export

@router.post("/projects/{project_id}/exports", response_model=ExportResponse)
async def create_export(
    project_id: str,
    export: ExportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create an export task (starts video rendering)"""
    # Verify project belongs to user
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db_export = Export(
        project_id=project_id,
        format=export.format,
        resolution=export.resolution,
        status="pending"
    )
    
    db.add(db_export)
    db.commit()
    db.refresh(db_export)
    
    # Queue background job for video rendering
    from app.tasks.export_tasks import render_video_task
    render_video_task.delay(db_export.id)
    
    return db_export

@router.get("/projects/{project_id}/exports", response_model=List[ExportResponse])
async def get_project_exports(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all exports for a project"""
    # Verify project belongs to user
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    exports = db.query(Export).filter(
        Export.project_id == project_id
    ).all()
    
    return exports

@router.get("/exports/{export_id}", response_model=ExportResponse)
async def get_export(
    export_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific export details"""
    export = await verify_export_access(export_id, current_user, db)
    return export

@router.delete("/exports/{export_id}")
async def delete_export(
    export_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an export"""
    export = await verify_export_access(export_id, current_user, db)
    
    # Don't delete if currently processing
    if export.status == "processing":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an export that is currently processing"
        )
    
    db.delete(export)
    db.commit()
    
    return {"message": "Export deleted successfully"}
