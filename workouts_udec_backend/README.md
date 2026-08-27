# 🏋️‍♂️ Workout Tracker FastAPI Backend

A FastAPI backend for workout tracking with user management, exercise database, and workout session management capabilities.

## 🚀 Features

### 👨‍💼 Admin Features
- ✅ **User Management**: Create, edit, and delete user accounts
- ✅ **Exercise Database**: Manage master list of exercises with weight-based and time-based classifications
- ✅ **Workout Templates**: Create and manage pre-built workout routines
- ✅ **System Administration**: Full administrative control over the platform

### 👤 User Features
- ✅ **Profile Management**: User registration and personal profile management
- ✅ **Workout Sessions**: Start, manage, and complete workout sessions
- ✅ **Exercise Tracking**: Add exercises with detailed sets, reps, weights, and duration tracking
- ✅ **Progress Monitoring**: View workout history and exercise progression over time
- ✅ **Notes & Comments**: Add comments to workouts and individual exercises
- ✅ **Template Access**: Browse and use public workout templates

## 🛠️ Technology Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with role-based access control
- **Migration**: Alembic for database schema management
- **Validation**: Pydantic for data validation and serialization
- **Documentation**: Automatic OpenAPI/Swagger documentation

## 📋 Prerequisites

- **Python**: 3.8 or higher
- **PostgreSQL**: 12 or higher
- **pip**: Python package manager

## ⚡ Quick Start

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd workouts_udec_backend
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the project root (or rename  `.env.example` to  `.env`):
```bash
SECRET_KEY=your-super-secret-key-change-this-in-production
POSTGRES_SERVER=localhost
POSTGRES_USER=workout_user
POSTGRES_PASSWORD=password
POSTGRES_DB=workouts_db
```

### 4. Database Setup
```bash
# Create PostgreSQL database (be sure to have the permission and create the user if needed)
postgres psql -c "CREATE DATABASE workouts_db OWNER workout_user;"

# Generate and apply the first migration for alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

# Create admin user
python3 create_admin.py
```

### 5. Start the Server
```bash
python3 main.py
```

🎉 **Your API is now running at**: `http://localhost:8000`

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 🔐 Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login with email/password |

### 👤 User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/register` | User registration |
| `GET` | `/api/users/me` | Get current user profile |
| `PUT` | `/api/users/me` | Update user profile |

### 💪 Exercise Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/exercises/` | List all active exercises | User |
| `GET` | `/api/exercises/{exercise_id}` | Get specific exercise | User |
| `POST` | `/api/exercises/` | Create new exercise | Admin |
| `PUT` | `/api/exercises/{exercise_id}` | Update exercise | Admin |
| `DELETE` | `/api/exercises/{exercise_id}` | Delete exercise | Admin |

### 🏃‍♂️ Workout Session Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/workouts/` | List user's workouts | User |
| `GET` | `/api/workouts/active` | Get active workout | User |
| `POST` | `/api/workouts/` | Start new workout | User |
| `GET` | `/api/workouts/{workout_id}` | Get specific workout | User |
| `PUT` | `/api/workouts/{workout_id}` | Update workout | User |
| `PUT` | `/api/workouts/{workout_id}/complete` | Complete workout | User |
| `DELETE` | `/api/workouts/{workout_id}` | Delete workout | User |
| `GET` | `/api/workouts/history` | View workout history | User |

### 📋 Workout Template System
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/workouts/templates` | List public workout templates | User |
| `GET` | `/api/workouts/templates/{template_id}` | Get specific workout template | User |
| `POST` | `/api/workouts/templates/{template_id}/create-workout` | Create workout from template | User |

### 📊 Exercise Tracking & Set Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/workouts/{workout_id}/exercises` | Add exercise to workout | User |
| `POST` | `/api/workouts/{workout_id}/exercises/{exercise_id}/sets` | Add set to exercise | User |
| `PUT` | `/api/workouts/{workout_id}/exercises/{exercise_id}/sets/{set_id}` | Update exercise set | User |
| `DELETE` | `/api/workouts/{workout_id}/exercises/{exercise_id}/sets/{set_id}` | Delete exercise set | User |
| `GET` | `/api/workouts/{workout_id}/progression/{exercise_id}` | View exercise progression | User |

### 📝 Comments & Notes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `PUT` | `/api/workouts/{workout_id}/notes` | Update workout notes | User |
| `PUT` | `/api/workouts/{workout_id}/exercises/{exercise_id}/notes` | Update exercise notes | User |

### 🛡️ Admin User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/users` | List all users |
| `POST` | `/api/admin/users` | Create user |
| `PUT` | `/api/admin/users/{user_id}` | Update user |
| `DELETE` | `/api/admin/users/{user_id}` | Delete user |

### 🛡️ Admin Template Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/workout-templates` | List all workout templates |
| `GET` | `/api/admin/workout-templates/{template_id}` | Get specific template |
| `POST` | `/api/admin/workout-templates` | Create workout template |
| `PUT` | `/api/admin/workout-templates/{template_id}` | Update workout template |
| `DELETE` | `/api/admin/workout-templates/{template_id}` | Delete workout template |
| `POST` | `/api/admin/workout-templates/{template_id}/exercises` | Add exercise to template |
| `DELETE` | `/api/admin/workout-templates/{template_id}/exercises/{exercise_id}` | Remove exercise from template |

## 🗄️ Database Schema

### Core Models

#### 👤 User
- User accounts with email authentication
- Role-based permissions (admin/user) 
- Profile management with username and full name

#### 💪 Exercise
- Master exercise database
- Exercise type classification (weight-based/time-based)
- Muscle group and equipment categorization

#### 📋 Workout Template
- Pre-built workout routines
- Public/private template system
- Template exercise configurations

#### 🏃‍♂️ Workout
- Individual workout sessions
- Start/completion timestamps
- Session notes and comments

#### 🎯 Workout Exercise
- Exercises within specific workouts
- Exercise ordering and notes
- Links workouts to exercises

#### 📊 Exercise Set
- Individual sets with performance data
- Reps, weight, duration tracking
- Rest period management

## 🔧 Development

### Database Migrations

Create new migration:
```bash
alembic revision --autogenerate -m "your migration message"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback migration:
```bash
alembic downgrade -1
```

### Running in Development
```bash
# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload (during dev)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Default Admin Account
- **Email**: `admin@example.com`
- **Password**: `admin123`
- ⚠️ **Change this password after first login!**

## 🔒 Security Features

- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Password Hashing**: Bcrypt for secure password storage
- ✅ **Role-Based Access**: Admin and user permission levels
- ✅ **Input Validation**: Comprehensive data validation
- ✅ **CORS Configuration**: Configurable cross-origin requests

## 📁 Project Structure

```
workouts_udec_backend/
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── dependencies.py          # Authentication dependencies
│   │   ├── main_router.py          # Main API router configuration
│   │   └── endpoints/
│   │       ├── __init__.py
│   │       ├── auth.py             # Authentication endpoints
│   │       ├── exercises.py        # Exercise CRUD operations  
│   │       ├── users.py           # User profile management
│   │       ├── workouts.py        # Workout session management
│   │       └── admin.py           # Administrative functions
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Application configuration
│   │   └── security.py           # JWT and password utilities
│   ├── crud/
│   │   ├── __init__.py
│   │   ├── base.py               # Base CRUD class with common operations
│   │   ├── crud_exercise.py      # Exercise database operations
│   │   ├── crud_user.py         # User database operations
│   │   └── crud_workout.py      # Workout database operations
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py              # Database imports aggregation
│   │   ├── base_class.py        # SQLAlchemy declarative base
│   │   └── session.py          # Database session management
│   ├── models/
│   │   ├── __init__.py
│   │   ├── exercise.py         # Exercise SQLAlchemy models
│   │   ├── user.py            # User SQLAlchemy models
│   │   └── workout.py         # Workout SQLAlchemy models
│   └── schemas/
│       ├── __init__.py
│       ├── exercise.py        # Exercise Pydantic schemas
│       ├── user.py           # User Pydantic schemas
│       └── workout.py        # Workout Pydantic schemas
├── alembic/
│   ├── env.py                # Alembic environment configuration
├── main.py                  # FastAPI application entry point
├── requirements.txt         # Python dependencies
├── create_admin.py         # Admin user creation script
├── example_request_exercise.py  # Example API usage script
├── alembic.ini            # Alembic configuration file
└── README.md              # Project documentation
```
