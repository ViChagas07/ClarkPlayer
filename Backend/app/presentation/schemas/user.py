"""
Pydantic schemas for user-profile endpoints.
"""

from pydantic import BaseModel, Field

# Request schemas for updating user profile information and changing the password. These schemas define
# the expected structure of the JSON body for the corresponding endpoints, including validation rules 
# for fields like display name, avatar URL, and password lengths.

class UpdateProfileRequest(BaseModel):
    display_name: str | None = Field(None, max_length=100)
    avatar_url: str | None = Field(None, max_length=500)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class DeleteAccountRequest(BaseModel):
    password: str  # Confirm identity with current password
