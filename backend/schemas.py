from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, List
from models import RequestType, RequestStage

# --- USER & TEAM SCHEMAS ---
class UserBase(BaseModel):
    username: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    team_id: Optional[int] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None

class TeamResponse(TeamBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class TeamWithMembersResponse(TeamResponse):
    members: List[UserResponse] = []

# --- EQUIPMENT SCHEMAS ---
class EquipmentBase(BaseModel):
    name: str
    serial_number: str
    category: Optional[str] = None
    purchase_date: Optional[date] = None
    warranty_start_date: Optional[date] = None
    warranty_end_date: Optional[date] = None
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
    maintenance_team_id: int
    default_technician_id: Optional[int] = None
    open_requests_count: int = 0
    model_config = ConfigDict(from_attributes=True)

# --- MAINTENANCE REQUEST SCHEMAS ---
class MaintenanceRequestBase(BaseModel):
    subject: str
    description: Optional[str] = None
    request_type: RequestType
    priority: Optional[str] = None
    equipment_id: int
    scheduled_date: Optional[date] = None
    notes: Optional[str] = None

class MaintenanceRequestCreate(MaintenanceRequestBase):
    maintenance_team_id: Optional[int] = None
    technician_id: Optional[int] = None

class MaintenanceRequestUpdate(BaseModel):
    stage: Optional[RequestStage] = None
    technician_id: Optional[int] = None
    duration: Optional[float] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    scheduled_date: Optional[date] = None
    maintenance_team_id: Optional[int] = None

class MaintenanceRequestResponse(MaintenanceRequestBase):
    id: int
    stage: RequestStage
    maintenance_team_id: int
    technician_id: Optional[int]
    created_date: Optional[date] = None
    completed_date: Optional[date] = None
    duration: float
    notes: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Signup Schema
class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    avatar_url: Optional[str] = None
    team_id: Optional[int] = None # Link to a specialized team [cite: 23]
    phone: Optional[str] = None

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

# --- WORKCENTER SCHEMAS ---
class WorkCenterBase(BaseModel):
    name: str
    code: str
    tag: Optional[str] = None
    alternative_workcenters: List[str] = []
    cost_per_hour: Optional[float] = None
    capacity_time_efficiency: Optional[float] = None
    oee_target: Optional[float] = None
    status: Optional[str] = None

class WorkCenterCreate(WorkCenterBase):
    pass

class WorkCenterResponse(WorkCenterBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- SEED RESPONSE SCHEMA ---
class SeedResponse(BaseModel):
    teams_created: int
    users_created: int
    equipment_created: int
    requests_created: int
    workcenters_created: int