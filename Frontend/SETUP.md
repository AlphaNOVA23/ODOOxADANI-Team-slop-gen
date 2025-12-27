# Frontend Setup Guide

## Environment Variables

Create a `.env.local` file in the Frontend directory with the following content:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Backend Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Start the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Setup

1. Install dependencies:
```bash
cd Frontend
npm install
```

2. Start the Next.js development server:
```bash
npm run dev
```

## API Connection

The frontend is now configured to connect to your FastAPI backend:

- **API Base URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable
- **Authentication**: JWT tokens stored in localStorage
- **CORS**: Backend configured to allow requests from `http://localhost:3000`

## Available API Endpoints

### Authentication
- `POST /login` - User login
- `POST /signup` - User registration  
- `GET /users/me` - Get current user info

### Equipment
- `GET /equipment/{id}` - Get equipment details

### Maintenance Requests
- `POST /requests/` - Create maintenance request
- `PATCH /requests/{id}` - Update maintenance request

## Usage

The Zustand store (`lib/store.ts`) now includes:
- Real API authentication (login/signup)
- Token management
- User state management
- Integration with existing mock data for development

You can now use the `useAppStore` hook in your components to access authentication and data management features.
