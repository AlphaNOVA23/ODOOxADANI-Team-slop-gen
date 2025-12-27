# GearGuard – The Ultimate Maintenance Tracker

GearGuard is a full-stack, Odoo-inspired maintenance management system designed to help organizations efficiently track company assets, manage specialized maintenance teams, and automate repair workflows.

The system seamlessly connects Equipment, Maintenance Teams, and Maintenance Requests, ensuring that breakdowns and preventive maintenance are handled intelligently, securely, and on time.

---

## Problem Statement

Organizations often face challenges in:
- Tracking assets across departments and locations
- Assigning maintenance tasks to the correct technicians
- Monitoring overdue repair requests
- Preventing reuse of scrapped or unsafe equipment

GearGuard addresses these challenges by providing a smart maintenance tracker with Kanban boards, calendar scheduling, real-time indicators, and automated backend logic similar to enterprise ERP systems like Odoo.

---

## System Architecture

Frontend (React + Next.js + TypeScript)  
↓  
REST API (JWT Secured)  
↓  
Backend (FastAPI)  
↓  
PostgreSQL + Celery + Redis

---

## Frontend

### Tech Stack
- React
- Next.js
- TypeScript

### Features
- Kanban Board with drag & drop (New → In Progress → Repaired → Scrap)
- Calendar view for Preventive Maintenance
- Technician avatar display on maintenance cards
- Red strip visual indicator for overdue maintenance
- Smart button badges showing open request count per equipment

---

## Backend

### Tech Stack
- Framework: FastAPI
- Database: PostgreSQL (gearguard_db)
- ORM: SQLAlchemy
- Migrations: Alembic
- Authentication: JWT (python-jose, passlib with Bcrypt)
- Background Tasks: Celery
- Message Broker: Redis

---

## Database Models

### Equipment
Tracks all company assets.

Key Fields:
- Equipment name and serial number
- Purchase date and warranty information
- Physical location / department
- Default maintenance team
- Default technician
- is_active flag to indicate usability


GearGuard demonstrates how intelligent automation, clean architecture, and thoughtful UI design can transform traditional maintenance tracking into a modern, scalable, and enterprise-ready solution.
