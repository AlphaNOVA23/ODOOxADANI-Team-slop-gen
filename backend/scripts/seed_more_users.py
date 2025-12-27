import os
from typing import List, Dict

from dotenv import load_dotenv

# Ensure we can import project modules when running this script directly
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

load_dotenv()

try:
    from database import SessionLocal
    import models
    import auth  # expects hash_password(str) -> str
except Exception as e:
    print("Failed importing app modules:", e)
    raise


def get_team_by_name(db, name: str):
    return db.query(models.MaintenanceTeam).filter(models.MaintenanceTeam.name == name).first()


def ensure_users(db, team, users: List[Dict]):
    created = 0
    for u in users:
        existing = db.query(models.User).filter(models.User.username == u["username"]).first()
        if existing:
            continue
        db_user = models.User(
            username=u["username"],
            hashed_password=auth.hash_password(u.get("password", "password123")),
            name=u.get("name"),
            avatar_url=u.get("avatar", "👤"),
            team_id=team.id if team else None,
        )
        db.add(db_user)
        created += 1
    if created:
        db.commit()
    return created


def main():
    db = SessionLocal()
    try:
        # Ensure base teams exist (use the same names as in /dev/seed)
        mechanics = get_team_by_name(db, "Mechanics")
        electricians = get_team_by_name(db, "Electricians")
        it_support = get_team_by_name(db, "IT Support")

        total_created = 0

        if mechanics:
            total_created += ensure_users(
                db,
                mechanics,
                [
                    {"username": "mike@gearguard.com", "name": "Mike Johnson", "avatar": "🛠️"},
                    {"username": "ravi@gearguard.com", "name": "Ravi Patel", "avatar": "🔧"},
                ],
            )

        if electricians:
            total_created += ensure_users(
                db,
                electricians,
                [
                    {"username": "tom@gearguard.com", "name": "Tom Wilson", "avatar": "⚡"},
                    {"username": "emma@gearguard.com", "name": "Emma Thompson", "avatar": "✨"},
                ],
            )

        if it_support:
            total_created += ensure_users(
                db,
                it_support,
                [
                    {"username": "lisa@gearguard.com", "name": "Lisa Chen", "avatar": "💻"},
                    {"username": "alex@gearguard.com", "name": "Alex Kumar", "avatar": "🖥️"},
                ],
            )

        print(f"Users created: {total_created}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
