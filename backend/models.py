from sqlalchemy import Column, Integer, String, Date, Float, Boolean, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class RequestType(enum.Enum):
    CORRECTIVE = "Corrective"  # Unplanned repair [cite: 28]
    PREVENTIVE = "Preventive"  # Planned maintenance [cite: 29]

class RequestStage(enum.Enum):
    NEW = "New"                # Initial state [cite: 42]
    IN_PROGRESS = "In Progress" # Execution stage [cite: 44]
    REPAIRED = "Repaired"      # Completion stage [cite: 45]
    SCRAP = "Scrap"            # Unusable state [cite: 55, 76]

class MaintenanceTeam(Base):
    __tablename__ = "maintenance_teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False) # e.g., Mechanics, IT Support [cite: 22]
    
    # Relationships
    members = relationship("User", back_populates="team") # Link specific users [cite: 23]
    equipment = relationship("Equipment", back_populates="maintenance_team")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    avatar_url = Column(String) # For the Kanban visual indicator [cite: 59]
    team_id = Column(Integer, ForeignKey("maintenance_teams.id"))
    
    team = relationship("MaintenanceTeam", back_populates="members")
    
class Equipment(Base):
    __tablename__ = "equipment"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # Equipment Name [cite: 16]
    serial_number = Column(String, unique=True) # Serial Number [cite: 16]
    purchase_date = Column(Date) # Purchase Date [cite: 17]
    warranty_info = Column(Text) # Warranty Information [cite: 17]
    location = Column(String) # Physical location [cite: 18]
    department = Column(String) # e.g., Production [cite: 11]
    employee_owner = Column(String) # Assigned employee name [cite: 11]
    is_active = Column(Boolean, default=True) # Logic for Scrap status 
    
    # Responsibility [cite: 12]
    maintenance_team_id = Column(Integer, ForeignKey("maintenance_teams.id"))
    default_technician_id = Column(Integer, ForeignKey("users.id"))
    
    maintenance_team = relationship("MaintenanceTeam", back_populates="equipment")
    requests = relationship("MaintenanceRequest", back_populates="equipment")

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False) # What is wrong? [cite: 31]
    request_type = Column(Enum(RequestType), default=RequestType.CORRECTIVE) # [cite: 27]
    stage = Column(Enum(RequestStage), default=RequestStage.NEW) # Workflow stages [cite: 42, 55]
    
    # Key Fields [cite: 30, 33, 34, 35]
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    maintenance_team_id = Column(Integer, ForeignKey("maintenance_teams.id"))
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True) # [cite: 43]
    
    scheduled_date = Column(Date) # When should work happen? [cite: 34]
    duration = Column(Float, default=0.0) # Hours spent [cite: 35, 45]
    
    equipment = relationship("Equipment", back_populates="requests")