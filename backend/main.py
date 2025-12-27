from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import auth, models, schemas
from database import SessionLocal, engine, get_db
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GearGuard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js default ports
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
        # Decode the JWT token using your secret key and algorithm
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
        
    # Fetch the user from the database to ensure they still exist
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# --- EQUIPMENT ROUTES ---

@app.get("/equipment/{equipment_id}", response_model=schemas.EquipmentResponse)
def get_equipment(equipment_id: int, db: Session = Depends(get_db)):
    """
    Returns equipment details including a 'Smart Button' count of open requests[cite: 71, 73].
    """
    equipment = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=44, detail="Equipment not found")
    
    # Logic for Smart Button Badge: Count open requests (New or In Progress) 
    open_count = db.query(models.MaintenanceRequest).filter(
        models.MaintenanceRequest.equipment_id == equipment_id,
        models.MaintenanceRequest.stage.in_([models.RequestStage.NEW, models.RequestStage.IN_PROGRESS])
    ).count()
    
    equipment.open_requests_count = open_count
    return equipment

# --- MAINTENANCE REQUEST ROUTES ---

@app.post("/requests/", response_model=schemas.MaintenanceRequestResponse)
def create_maintenance_request(request: schemas.MaintenanceRequestCreate, db: Session = Depends(get_db)):
    """
    Flow 1 & 2: Handles both Breakdown (Corrective) and Routine (Preventive)[cite: 38, 46].
    Implements Auto-Fill Logic[cite: 40, 41].
    """
    # 1. Fetch the Equipment to get defaults 
    equipment = db.query(models.Equipment).filter(models.Equipment.id == request.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    # 2. Auto-Fill Logic: Fetch Team and Technician from equipment record 
    new_request = models.MaintenanceRequest(
        **request.model_dump(),
        maintenance_team_id=equipment.maintenance_team_id,
        technician_id=equipment.default_technician_id,
        stage=models.RequestStage.NEW # Starts in New stage [cite: 42]
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@app.patch("/requests/{request_id}", response_model=schemas.MaintenanceRequestResponse)
def update_request_stage(request_id: int, update_data: schemas.MaintenanceRequestUpdate, db: Session = Depends(get_db)):
    """
    Handles stage transitions (Execution and Completion)[cite: 44, 45].
    Implements Scrap Logic[cite: 74, 76].
    """
    db_request = db.query(models.MaintenanceRequest).filter(models.MaintenanceRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Update fields provided by the user (Technician, Duration, or Stage) [cite: 43, 45]
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(db_request, key, value)

    # Scrap Logic Automation [cite: 74, 76]
    if db_request.stage == models.RequestStage.SCRAP:
        equipment = db.query(models.Equipment).filter(models.Equipment.id == db_request.equipment_id).first()
        if equipment:
            equipment.is_active = False # Mark as no longer usable 
    
    db.commit()
    db.refresh(db_request)
    return db_request

# --- SIGNUP ROUTE ---
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
        team_id=user_data.team_id
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