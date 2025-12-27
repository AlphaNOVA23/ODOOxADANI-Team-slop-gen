from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, List
from models import RequestType, RequestStage
from pydantic import BaseModel, EmailStr
from typing import Optional

# --- USER & TEAM SCHEMAS ---
class UserBase(BaseModel):
    username: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    team_id: Optional[int] = None

class UserResponse(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class TeamBase(BaseModel):
    name: str

class TeamResponse(TeamBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- EQUIPMENT SCHEMAS ---
class EquipmentBase(BaseModel):
    name: str
    serial_number: str
    purchase_date: Optional[date] = None
    warranty_info: Optional[str] = None
    location: Optional[str] = None
    department: Optional[str] = None
    employee_owner: Optional[str] = None

class EquipmentCreate(EquipmentBase):
    maintenance_team_id: int
    default_technician_id: Optional[int] = None

class EquipmentResponse(EquipmentBase):
    id: int
    is_active: bool
    open_requests_count: int = 0
    model_config = ConfigDict(from_attributes=True)

# --- MAINTENANCE REQUEST SCHEMAS ---
class MaintenanceRequestBase(BaseModel):
    subject: str
    request_type: RequestType
    equipment_id: int
    scheduled_date: Optional[date] = None

class MaintenanceRequestCreate(MaintenanceRequestBase):
    maintenance_team_id: Optional[int] = None
    technician_id: Optional[int] = None

class MaintenanceRequestUpdate(BaseModel):
    stage: Optional[RequestStage] = None
    technician_id: Optional[int] = None
    duration: Optional[float] = None

class MaintenanceRequestResponse(MaintenanceRequestBase):
    id: int
    stage: RequestStage
    maintenance_team_id: int
    technician_id: Optional[int]
    duration: float
    model_config = ConfigDict(from_attributes=True)
    
# Signup Schema
class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    avatar_url: Optional[str] = None
    team_id: Optional[int] = None # Link to a specialized team [cite: 23]

# Login Schema
class UserLogin(BaseModel):
    username: str
    password: str

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None