# Server Directory Structure

## 📁 **Server Directory Overview**

The `server` directory contains the **FastAPI backend** that provides the API services for the healthcare application. This comprehensive backend handles authentication, database operations, business logic, and API endpoints for all healthcare-related functionality.

---

## 🏗️ **Directory Structure**

```
server/
├── app/
│   ├── main.py                 # Main FastAPI application entry point
│   ├── api/                    # API layer
│   │   ├── deps.py            # API dependencies
│   │   └── routes/            # All API endpoints organized by functionality
│   │       ├── admin.py       # Admin user management
│   │       ├── auth.py        # Authentication (login, register)
│   │       ├── doctor.py      # Doctor profiles and availability
│   │       ├── patient.py     # Patient management
│   │       ├── appointments.py # Appointment booking and management
│   │       ├── medical_records.py # Medical records handling
│   │       ├── prescriptions.py # Prescription management
│   │       └── ...            # Other specialized routes
│   ├── core/                   # Core components
│   │   ├── database.py        # Database connection and session management
│   │   ├── security.py        # Authentication and authorization
│   │   └── dependencies.py    # FastAPI dependency injection
│   ├── middleware/             # Request processing middleware
│   │   ├── security.py        # Security headers middleware
│   │   ├── tenant.py          # Tenant context middleware
│   │   └── audit.py           # Audit context middleware
│   ├── models/                 # Database models (SQLAlchemy ORM)
│   │   ├── user.py            # User authentication model
│   │   ├── doctor.py          # Doctor profile model
│   │   ├── patient.py         # Patient profile model
│   │   ├── appointment.py     # Appointment model
│   │   ├── medical_record.py  # Medical records model
│   │   ├── prescription.py    # Prescription model
│   │   ├── tenant.py          # Multi-tenant support
│   │   └── base.py            # Base model with soft delete functionality
│   └── services/              # Business logic services
│       ├── appointment_service.py # Appointment booking logic
│       └── audit_service.py   # Audit logging services
└── migrations/                # Database migrations (Alembic)
    ├── versions/              # Migration files
    └── alembic.ini             # Alembic configuration
```

---

## 🚀 **Core Components**

### **Main Application (`server/app/main.py`)**
- **Purpose**: Main FastAPI application entry point
- **Key Features**:
  - CORS configuration for frontend communication
  - Middleware setup and ordering
  - Application startup events
  - Error handling configuration
- **Key Functions**: 
  - `create_app()` - Application factory pattern
  - Startup/shutdown event handlers

### **API Layer (`server/app/api/`)**
The API layer is organized by functional domains:

#### **Authentication Routes (`auth.py`)**
- User login and registration
- JWT token generation and validation
- Password reset functionality
- Role-based access control

#### **Admin Routes (`admin.py`)**
- Admin user management
- User creation and management
- Tenant administration
- System configuration

#### **Doctor Routes (`doctor.py`)**
- Doctor profile management
- Doctor availability scheduling
- Profile updates and verification
- Specialization management

#### **Patient Routes (`patient.py`)**
- Patient profile management
- Medical record access
- Appointment booking
- Personal information updates

#### **Appointment Routes (`appointments.py`)**
- Appointment creation and management
- Availability checking
- Status updates (scheduled, confirmed, cancelled)
- Calendar integration

#### **Medical Records Routes (`medical_records.py`)**
- Medical record creation and updates
- Patient history management
- Record access control
- HIPAA compliance features

---

## 🗄️ **Database Models (`server/app/models/`)**

### **User Management Models**
- **`user.py`**: Authentication and user account data
- **`tenant.py`**: Multi-tenant architecture support
- **`admin.py`**: Administrator profiles

### **Healthcare Models**
- **`doctor.py`**: Doctor profiles, specialties, licensing
- **`patient.py`**: Patient demographics, medical history
- **`appointment.py`**: Appointment scheduling and status
- **`medical_record.py`**: Patient medical records and history
- **`prescription.py`**: Medication prescriptions and details

### **Supporting Models**
- **`base.py`**: Base model with soft delete functionality
- **`doctor_availability.py`**: Doctor scheduling and availability
- **`document.py`**: Document management and storage
- **`audit_log.py`**: System audit trail and logging

---

## ⚙️ **Core Services (`server/app/core/`)**

### **Database Management (`database.py`)**
- SQLAlchemy async engine configuration
- Database session management
- Connection pooling
- Transaction handling

### **Security (`security.py`)**
- JWT token generation and validation
- Password hashing and verification
- Role-based access control
- API key management

### **Dependencies (`dependencies.py`)**
- FastAPI dependency injection
- Authentication middleware
- Database session dependencies
- Role verification helpers

---

## 🛡️ **Middleware (`server/app/middleware/`)**

### **Security Middleware**
- HTTP security headers
- CORS handling
- Rate limiting
- Request validation

### **Tenant Middleware**
- Multi-tenant request routing
- Tenant context management
- Data isolation

### **Audit Middleware**
- Request logging
- User activity tracking
- Compliance logging

---

## 🔧 **Services Layer (`server/app/services/`)**

### **Appointment Service**
- Business logic for appointment booking
- Availability checking and validation
- Conflict resolution
- Notification handling

### **Audit Service**
- System audit trail
- Compliance logging
- User activity tracking
- Security event logging

---

## 🎯 **Key Features**

### **🔐 Authentication & Authorization**
- JWT token-based authentication
- Role-based access control (ADMIN, DOCTOR, PATIENT)
- Multi-tenant architecture support
- Secure password handling

### **📊 Healthcare-Specific Functionality**
- Complete doctor registration and profile management
- Patient registration with comprehensive demographics
- Appointment booking and scheduling system
- Medical records management with HIPAA considerations
- Prescription management and tracking

### **🗄️ Database Integration**
- SQLAlchemy ORM with async support
- PostgreSQL database compatibility
- Soft delete functionality for data integrity
- Comprehensive audit logging

### **🔒 Security & Compliance**
- CORS configuration for frontend integration
- Security headers middleware
- Input validation with Pydantic models
- Audit trail for compliance requirements

---

## 🚀 **How It Works**

1. **Application Startup**: `main.py` initializes the FastAPI app with all middleware
2. **Request Routing**: API routes in `api/routes/` handle endpoint requests
3. **Authentication**: Security middleware validates JWT tokens and roles
4. **Database Operations**: Models in `models/` interact with PostgreSQL database
5. **Business Logic**: Services layer handles complex operations and validation
6. **Response**: API responses are formatted and returned with proper HTTP status codes

---

## 📋 **Recent Enhancements**

### **✅ CORS Configuration Fix**
- Added support for frontend ports 5173 and 5174
- Fixed middleware ordering for proper request handling
- Resolved 400 Bad Request errors on OPTIONS requests

### **✅ Doctor Registration Enhancement**
- Added `date_of_birth` field to doctor registration API
- Updated doctor model to support complete profile data
- Fixed admin registration to save all doctor fields consistently

### **✅ Admin Registration Fix**
- Fixed missing `phone` and `date_of_birth` fields in admin doctor creation
- Ensured consistency between admin and self-registration flows
- Cleaned up debug code for production readiness

### **✅ Code Quality Improvements**
- Removed debug console.log statements throughout codebase
- Standardized error handling across all API endpoints
- Improved input validation and sanitization

---

## 🔄 **Development Workflow**

### **Local Development**
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Database Migrations**
```bash
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

### **Testing**
```bash
pytest tests/
pytest tests/test_auth.py -v
```

---

## 🎯 **API Documentation**

When the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

These provide interactive API documentation with testing capabilities for all endpoints.

---

## 📊 **Performance & Scalability**

- **Async Support**: Full async/await support for high concurrency
- **Database Pooling**: Connection pooling for optimal performance
- **Caching**: Redis integration for session and data caching
- **Load Balancing**: Ready for horizontal scaling
- **Monitoring**: Built-in health checks and metrics

---

## 🔒 **Security Considerations**

- **Input Validation**: All inputs validated with Pydantic models
- **SQL Injection Protection**: SQLAlchemy ORM provides protection
- **XSS Prevention**: Proper input sanitization and output encoding
- **CSRF Protection**: Built-in CSRF protection for state-changing operations
- **Rate Limiting**: Configurable rate limiting for API endpoints
- **Audit Trail**: Complete audit logging for compliance

---

## 🚀 **Production Deployment**

The server is designed for production deployment with:
- **Docker Support**: Containerized deployment ready
- **Environment Configuration**: Environment-based configuration
- **Health Checks**: Built-in health check endpoints
- **Logging**: Structured logging for monitoring and debugging
- **Metrics**: Performance metrics and monitoring integration

---

## 📞 **Support & Maintenance**

The server codebase is designed for maintainability with:
- **Comprehensive Documentation**: Inline code documentation
- **Type Hints**: Full type annotation support
- **Error Handling**: Consistent error handling patterns
- **Testing**: Unit and integration test coverage
- **Monitoring**: Built-in health and performance monitoring

---

**The server directory represents a complete, production-ready backend infrastructure for the healthcare application, providing all necessary APIs, security, and business logic for a modern healthcare management system.** 🎯🏥⚕️
