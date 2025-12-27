from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import os

import auth
import models
import schemas

from database import engine, get_db
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Create tables
if os.getenv("AUTO_CREATE_TABLES") == "true":
    models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GearGuard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "avatar_url": current_user.avatar_url,
        "team_id": current_user.team_id,
        "email": None,
        "phone": None,
    }

@app.get("/technicians", response_model=List[schemas.UserResponse])
def list_technicians(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "name": u.name,
            "avatar_url": u.avatar_url,
            "team_id": u.team_id,
            "email": None,
            "phone": None,
        }
        for u in users
    ]

@app.get("/teams", response_model=List[schemas.TeamResponse])
def list_teams(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    teams = db.query(models.MaintenanceTeam).all()
    return [{"id": t.id, "name": t.name, "description": t.description} for t in teams]

@app.get("/teams/with-members", response_model=List[schemas.TeamWithMembersResponse])
def list_teams_with_members(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    teams = db.query(models.MaintenanceTeam).all()
    result = []
    for t in teams:
        members = db.query(models.User).filter(models.User.team_id == t.id).all()
        result.append(
            {
                "id": t.id,
                "name": t.name,
                "description": t.description,
                "members": [
                    {
                        "id": m.id,
                        "username": m.username,
                        "name": m.name,
                        "avatar_url": m.avatar_url,
                        "team_id": m.team_id,
                        "email": None,
                        "phone": None,
                    }
                    for m in members
                ],
            }
        )
    return result

@app.post("/equipment", response_model=schemas.EquipmentResponse)
def create_equipment(
    equipment_data: schemas.EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_equipment = models.Equipment(**equipment_data.model_dump(exclude_unset=True))
    db.add(new_equipment)
    db.commit()
    db.refresh(new_equipment)

    open_count = 0
    return {
        "id": new_equipment.id,
        "name": new_equipment.name,
        "serial_number": new_equipment.serial_number,
        "category": new_equipment.category,
        "purchase_date": new_equipment.purchase_date,
        "warranty_start_date": new_equipment.warranty_start_date,
        "warranty_end_date": new_equipment.warranty_end_date,
        "warranty_info": new_equipment.warranty_info,
        "location": new_equipment.location,
        "department": new_equipment.department,
        "employee_owner": new_equipment.employee_owner,
        "is_active": new_equipment.is_active,
        "maintenance_team_id": new_equipment.maintenance_team_id,
        "default_technician_id": new_equipment.default_technician_id,
        "open_requests_count": open_count,
    }

@app.get("/equipment/{equipment_id}", response_model=schemas.EquipmentResponse)
def get_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Returns equipment details including a 'Smart Button' count of open requests[cite: 71, 73].
    """
    equipment = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Logic for Smart Button Badge: Count open requests (New or In Progress) 
    open_count = db.query(models.MaintenanceRequest).filter(
        models.MaintenanceRequest.equipment_id == equipment_id,
        models.MaintenanceRequest.stage.in_([models.RequestStage.NEW, models.RequestStage.IN_PROGRESS])
    ).count()
    
    return {
        "id": equipment.id,
        "name": equipment.name,
        "serial_number": equipment.serial_number,
        "category": equipment.category,
        "purchase_date": equipment.purchase_date,
        "warranty_start_date": equipment.warranty_start_date,
        "warranty_end_date": equipment.warranty_end_date,
        "warranty_info": equipment.warranty_info,
        "location": equipment.location,
        "department": equipment.department,
        "employee_owner": equipment.employee_owner,
        "is_active": equipment.is_active,
        "maintenance_team_id": equipment.maintenance_team_id,
        "default_technician_id": equipment.default_technician_id,
        "open_requests_count": open_count,
    }

@app.get("/equipment", response_model=List[schemas.EquipmentResponse])
def list_equipment(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    equipment_items = db.query(models.Equipment).all()
    result = []
    for eq in equipment_items:
        open_count = db.query(models.MaintenanceRequest).filter(
            models.MaintenanceRequest.equipment_id == eq.id,
            models.MaintenanceRequest.stage.in_([models.RequestStage.NEW, models.RequestStage.IN_PROGRESS]),
        ).count()
        result.append(
            {
                "id": eq.id,
                "name": eq.name,
                "serial_number": eq.serial_number,
                "category": eq.category,
                "purchase_date": eq.purchase_date,
                "warranty_start_date": eq.warranty_start_date,
                "warranty_end_date": eq.warranty_end_date,
                "warranty_info": eq.warranty_info,
                "location": eq.location,
                "department": eq.department,
                "employee_owner": eq.employee_owner,
                "is_active": eq.is_active,
                "maintenance_team_id": eq.maintenance_team_id,
                "default_technician_id": eq.default_technician_id,
                "open_requests_count": open_count,
            }
        )
    return result

@app.post("/requests/", response_model=schemas.MaintenanceRequestResponse)
def create_maintenance_request(
    request: schemas.MaintenanceRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Flow 1 & 2: Handles both Breakdown (Corrective) and Routine (Preventive)[cite: 38, 46].
    Implements Auto-Fill Logic[cite: 40, 41].
    """
    # 1. Fetch the Equipment to get defaults 
    equipment = db.query(models.Equipment).filter(models.Equipment.id == request.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    # 2. Auto-Fill Logic: Fetch Team and Technician from equipment record 
    request_payload = request.model_dump(exclude_unset=True)
    allowed_keys = {"subject", "request_type", "equipment_id", "scheduled_date", "priority", "description", "notes"}
    filtered_payload = {k: v for k, v in request_payload.items() if k in allowed_keys}

    new_request = models.MaintenanceRequest(
        **filtered_payload,
        maintenance_team_id=equipment.maintenance_team_id,
        technician_id=equipment.default_technician_id,
        stage=models.RequestStage.NEW,
        created_date=date.today(),
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@app.patch("/requests/{request_id}", response_model=schemas.MaintenanceRequestResponse)
def update_request_stage(
    request_id: int,
    update_data: schemas.MaintenanceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Handles stage transitions (Execution and Completion)[cite: 44, 45].
    Implements Scrap Logic[cite: 74, 76].
    """
    db_request = db.query(models.MaintenanceRequest).filter(models.MaintenanceRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Update fields provided by the user (Technician, Duration, or Stage) [cite: 43, 45]
    update_payload = update_data.model_dump(exclude_unset=True)
    allowed_keys = {"technician_id", "duration", "stage", "priority", "description", "notes"}
    for key, value in update_payload.items():
        if key in allowed_keys:
            setattr(db_request, key, value)

    if db_request.stage == models.RequestStage.REPAIRED and db_request.completed_date is None:
        db_request.completed_date = date.today()

    # Scrap Logic Automation [cite: 74, 76]
    if db_request.stage == models.RequestStage.SCRAP:
        equipment = db.query(models.Equipment).filter(models.Equipment.id == db_request.equipment_id).first()
        if equipment:
            equipment.is_active = False # Mark as no longer usable 
    
    db.commit()
    db.refresh(db_request)
    return db_request

@app.get("/requests", response_model=List[schemas.MaintenanceRequestResponse])
def list_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    stage: Optional[models.RequestStage] = None,
):
    query = db.query(models.MaintenanceRequest)
    if stage is not None:
        query = query.filter(models.MaintenanceRequest.stage == stage)
    return query.all()

@app.get("/requests/{request_id}", response_model=schemas.MaintenanceRequestResponse)
def get_request(request_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    r = db.query(models.MaintenanceRequest).filter(models.MaintenanceRequest.id == request_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")
    return r

@app.post("/signup", response_model=schemas.Token)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Hash the password and create user
    hashed_pwd = auth.hash_password(user_data.password)
    new_user = models.User(
        username=user_data.username,
        hashed_password=hashed_pwd,
        name=user_data.name,
        avatar_url=user_data.avatar_url,
        team_id=user_data.team_id,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Auto-login after signup by returning a token
    access_token = auth.create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# --- LOGIN ROUTE ---
@app.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    
    user = db.query(models.User).filter(models.User.username == credentials.username).first()
    
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/workcenters", response_model=List[schemas.WorkCenterResponse])
def list_workcenters(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.WorkCenter).all()


@app.post("/workcenters", response_model=schemas.WorkCenterResponse)
def create_workcenter(
    payload: schemas.WorkCenterCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    wc = models.WorkCenter(**payload.model_dump(exclude_unset=True))
    db.add(wc)
    db.commit()
    db.refresh(wc)
    return wc


@app.post("/dev/seed", response_model=schemas.SeedResponse)
def seed_dummy_data(confirm: bool = False, db: Session = Depends(get_db)):
    if not confirm:
        raise HTTPException(status_code=400, detail="Set confirm=true to seed dummy data")

    teams_created = 0
    users_created = 0
    equipment_created = 0
    requests_created = 0
    workcenters_created = 0

    if db.query(models.MaintenanceTeam).count() == 0:
        t1 = models.MaintenanceTeam(name="Mechanics", description="General machinery repair")
        t2 = models.MaintenanceTeam(name="Electricians", description="Electrical systems")
        t3 = models.MaintenanceTeam(name="IT Support", description="Computer and IT equipment")
        db.add_all([t1, t2, t3])
        db.commit()
        teams_created = 3

    teams = db.query(models.MaintenanceTeam).all()
    team_id = teams[0].id if teams else None

    if db.query(models.User).count() == 0 and team_id is not None:
        u1 = models.User(
            username="john@gearguard.com",
            hashed_password=auth.hash_password("password123"),
            name="John Smith",
            avatar_url="👨‍🔧",
            team_id=team_id,
        )
        u2 = models.User(
            username="sarah@gearguard.com",
            hashed_password=auth.hash_password("password123"),
            name="Sarah Davis",
            avatar_url="👩‍🔧",
            team_id=team_id,
        )
        db.add_all([u1, u2])
        db.commit()
        users_created = 2

    technician = db.query(models.User).first()
    if technician is None or team_id is None:
        return {
            "teams_created": teams_created,
            "users_created": users_created,
            "equipment_created": equipment_created,
            "requests_created": requests_created,
            "workcenters_created": workcenters_created,
        }

    if db.query(models.Equipment).count() == 0:
        eq1 = models.Equipment(
            name="CNC Machine A",
            serial_number="CNC-2023-001",
            category="Machinery",
            purchase_date=date.today(),
            warranty_start_date=date.today(),
            warranty_end_date=date.today(),
            location="Building A, Floor 2",
            department="Production",
            employee_owner="Mitchell Admin",
            maintenance_team_id=team_id,
            default_technician_id=technician.id,
            is_active=True,
        )
        eq2 = models.Equipment(
            name="Hydraulic Press",
            serial_number="HYD-2023-002",
            category="Machinery",
            purchase_date=date.today(),
            warranty_start_date=date.today(),
            warranty_end_date=date.today(),
            location="Building A, Floor 1",
            department="Production",
            employee_owner="Mitchell Admin",
            maintenance_team_id=team_id,
            default_technician_id=technician.id,
            is_active=True,
        )
        db.add_all([eq1, eq2])
        db.commit()
        equipment_created = 2

    equipment = db.query(models.Equipment).first()
    if equipment and db.query(models.MaintenanceRequest).count() == 0:
        r1 = models.MaintenanceRequest(
            subject="Leaking Oil",
            description="Hydraulic fluid leaking from main cylinder",
            request_type=models.RequestType.CORRECTIVE,
            stage=models.RequestStage.NEW,
            priority="High",
            equipment_id=equipment.id,
            maintenance_team_id=equipment.maintenance_team_id,
            technician_id=equipment.default_technician_id,
            scheduled_date=date.today(),
            created_date=date.today(),
            duration=0.0,
            notes="Auto-seeded",
        )
        db.add(r1)
        db.commit()
        requests_created = 1

    if db.query(models.WorkCenter).count() == 0:
        wc1 = models.WorkCenter(
            name="Assembly 1",
            code="WC-001",
            tag="A1-MAIN",
            alternative_workcenters=["Assembly 2", "Assembly 3"],
            cost_per_hour=85.5,
            capacity_time_efficiency=92.5,
            oee_target=85.0,
            status="Active",
        )
        wc2 = models.WorkCenter(
            name="CNC Machine 1",
            code="WC-003",
            tag="CNC-001",
            alternative_workcenters=["CNC Machine 2"],
            cost_per_hour=120.0,
            capacity_time_efficiency=95.2,
            oee_target=90.0,
            status="Maintenance",
        )
        db.add_all([wc1, wc2])
        db.commit()
        workcenters_created = 2

    return {
        "teams_created": teams_created,
        "users_created": users_created,
        "equipment_created": equipment_created,
        "requests_created": requests_created,
        "workcenters_created": workcenters_created,
    }