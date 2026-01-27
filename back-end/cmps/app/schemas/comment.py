"""
Comment schemas
Request and response models for complaint comments
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class CreateCommentRequest(BaseModel):
    """Request model for creating a comment"""
    comment: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Comment text (1-2000 characters)"
    )
    isInternal: Optional[bool] = Field(
        False,
        description="Internal comment visible only to admins (admin-only field)"
    )
    
    @validator('comment')
    def validate_comment(cls, v):
        """Validate comment is not just whitespace"""
        if not v or not v.strip():
            raise ValueError('Comment cannot be empty or just whitespace')
        return v.strip()


class CommentResponse(BaseModel):
    """Response model for a comment"""
    commentId: str
    complaintId: str
    userId: str
    userName: str
    userRole: str
    userEmail: Optional[str] = None
    comment: str
    isInternal: bool
    createdAt: str
    updatedAt: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "commentId": "65a1b2c3d4e5f6g7h8i9j0k7",
                "complaintId": "CMP-2026-001234",
                "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
                "userName": "John Doe",
                "userRole": "Customer",
                "userEmail": "john.doe@example.com",
                "comment": "Thank you for the quick response. When can I expect the replacement?",
                "isInternal": False,
                "createdAt": "2026-01-26T11:00:00.000Z"
            }
        }


class CommentsListResponse(BaseModel):
    """Response model for list of comments"""
    comments: list
    pagination: dict
    
    class Config:
        json_schema_extra = {
            "example": {
                "comments": [
                    {
                        "commentId": "65a1b2c3d4e5f6g7h8i9j0k7",
                        "complaintId": "CMP-2026-001234",
                        "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
                        "userName": "John Doe",
                        "userRole": "Customer",
                        "comment": "Thank you for the update",
                        "isInternal": False,
                        "createdAt": "2026-01-26T11:00:00.000Z"
                    }
                ],
                "pagination": {
                    "currentPage": 1,
                    "totalPages": 1,
                    "totalItems": 5,
                    "itemsPerPage": 10
                }
            }
        }
