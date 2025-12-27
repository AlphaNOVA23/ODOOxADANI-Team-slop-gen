from celery import Celery
from datetime import datetime
from database import SessionLocal
import models

celery_app = Celery("tasks", broker="redis://localhost:6379/0")

@celery_app.task
def check_overdue_tasks():
    db = SessionLocal()
    # Find requests where scheduled_date is in the past and not repaired/scrapped [cite: 34, 55, 60]
    overdue_requests = db.query(models.MaintenanceRequest).filter(
        models.MaintenanceRequest.scheduled_date < datetime.now().date(),
        models.MaintenanceRequest.stage.notin_(["Repaired", "Scrap"])
    ).all()
    
    for req in overdue_requests:
        # Example: Log a note or update a 'is_overdue' flag
        print(f"Request {req.id} for equipment {req.equipment_id} is overdue!")
    db.close()