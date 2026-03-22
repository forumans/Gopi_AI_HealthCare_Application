# Database Architecture and Design Specification - Healthcare SaaS Platform

## Project Overview

You are an expert database architect responsible for designing and implementing a comprehensive database architecture for the multi-tenant healthcare platform. The database design must ensure data security, HIPAA compliance, scalability, and optimal performance for healthcare operations.

## Database Architecture Goals

### Primary Objectives
- Design a scalable multi-tenant database architecture
- Ensure complete HIPAA compliance for all healthcare data
- Optimize performance for medical data processing and queries
- Implement robust data security and encryption
- Support real-time features and concurrent access
- Enable efficient audit trail and compliance logging
- Provide disaster recovery and data backup capabilities

### Healthcare-Specific Requirements
- Complete isolation of PHI (Protected Health Information) between tenants
- Optimized queries for medical record searches and retrievals
- Efficient handling of medical imaging and large file storage
- Support for complex healthcare workflows and business logic
- Audit logging for all PHI access and modifications
- Data retention policies and automated cleanup
- Integration with external healthcare systems (EHR, labs, pharmacies)

## Database Technology Stack

### Primary Database System
- **Database**: PostgreSQL 14+ with advanced JSONB support
- **ORM**: SQLAlchemy with async support for Python
- **Migration Tool**: Alembic for database schema management
- **Connection Pooling**: PgBouncer for connection management
- **Replication**: Streaming replication for high availability
- **Backup**: pg_dump and WAL-E for continuous backup

### Supporting Database Systems
- **Cache**: Redis 6+ for session management and caching
- **Search**: Elasticsearch for advanced medical record search
- **Time Series**: TimescaleDB for performance metrics
- **File Storage**: AWS S3 with encryption for medical images
- **Analytics**: PostgreSQL with analytical extensions

## Multi-Tenant Architecture Design

### Tenant Isolation Strategy

#### Database Isolation Models
- **Shared Database, Shared Schema**: Single database with tenant_id columns
- **Row-Level Security**: PostgreSQL RLS for tenant data isolation
- **Schema Separation**: Optional schema separation per tenant for large tenants
- **Connection Pooling**: Tenant-aware connection pooling

#### Tenant Data Architecture
- **Tenant Metadata**: Central tenant management with configuration
- **Data Partitioning**: Partitioning by tenant_id for large datasets
- **Index Strategy**: Tenant-aware indexing for optimal query performance
- **Security Policies**: RLS policies enforcing tenant isolation

### Multi-Tenant Schema Design

#### Core Multi-Tenant Tables
- **tenants**: Tenant configuration and metadata
- **users**: User accounts with tenant association
- **user_roles**: Role definitions and permissions per tenant
- **tenant_settings**: Tenant-specific configuration and preferences

#### Tenant-Aware Data Tables
- **patients**: Patient records with tenant association
- **medical_records**: Medical records with tenant isolation
- **appointments**: Appointment scheduling with tenant context
- **prescriptions**: Prescription data with tenant security

## Core Database Schema Design

### User and Authentication Schema

#### Users Table
- **id**: UUID primary key for user identification
- **tenant_id**: UUID foreign key for tenant association
- **email**: Unique email address with validation
- **password_hash**: Encrypted password hash
- **first_name**: User first name
- **last_name**: User last name
- **role**: User role (admin, doctor, patient, staff)
- **is_active**: Boolean for account status
- **created_at**: Timestamp for account creation
- **updated_at**: Timestamp for last update
- **last_login**: Timestamp for last login
- **email_verified**: Boolean for email verification status
- **phone**: Optional phone number
- **profile_data**: JSONB for additional profile information

#### User Sessions Table
- **id**: UUID primary key
- **user_id**: UUID foreign key to users table
- **session_token**: Unique session token
- **expires_at**: Session expiration timestamp
- **created_at**: Session creation timestamp
- **last_accessed**: Last access timestamp
- **ip_address**: IP address of session
- **user_agent**: Browser user agent
- **is_active**: Boolean for session status

### Patient Management Schema

#### Patients Table
- **id**: UUID primary key
- **tenant_id**: UUID foreign key for tenant association
- **user_id**: UUID foreign key to users table (for patient portal access)
- **medical_record_number**: Unique medical record number
- **first_name**: Patient first name
- **last_name**: Patient last name
- **date_of_birth**: Date of birth
- **gender**: Gender (male, female, other)
- **phone**: Primary phone number
- **email**: Email address
- **address**: JSONB for address information
- **emergency_contact**: JSONB for emergency contact details
- **insurance_info**: JSONB for insurance information
- **medical_history**: JSONB for medical history summary
- **allergies**: JSONB for known allergies
- **medications**: JSONB for current medications
- **created_at**: Record creation timestamp
- **updated_at**: Last update timestamp
- **is_active**: Boolean for patient status

#### Patient Insurance Table
- **id**: UUID primary key
- **patient_id**: UUID foreign key to patients table
- **tenant_id**: UUID foreign key for tenant association
- **insurance_provider**: Insurance company name
- **policy_number**: Insurance policy number
- **group_number**: Insurance group number
- **member_id**: Insurance member ID
- **coverage_type**: Type of coverage (primary, secondary)
- **effective_date**: Coverage effective date
- **expiration_date**: Coverage expiration date
- **created_at**: Record creation timestamp
- **updated_at**: Last update timestamp
- **is_active**: Boolean for policy status

### Appointment Management Schema

#### Appointments Table
- **id**: UUID primary key
- **tenant_id**: UUID foreign key for tenant association
- **patient_id**: UUID foreign key to patients table
- **doctor_id**: UUID foreign key to users table (doctor)
- **appointment_type**: Type of appointment (consultation, follow-up, emergency)
- **status**: Appointment status (scheduled, confirmed, completed, cancelled)
- **scheduled_date**: Scheduled appointment date
- **scheduled_time**: Scheduled appointment time
- **duration**: Appointment duration in minutes
- **reason**: Reason for appointment
- **notes**: Clinical notes for appointment
- **room_id**: Consultation room identifier
- **created_at**: Appointment creation timestamp
- **updated_at**: Last update timestamp
- **created_by**: UUID of user who created appointment
- **confirmed_at**: Appointment confirmation timestamp
- **checked_in_at**: Patient check-in timestamp
- **started_at**: Appointment start timestamp
- **completed_at**: Appointment completion timestamp

#### Doctor Availability Table
- **id**: UUID primary key
- **tenant_id**: UUID foreign key for tenant association
- **doctor_id**: UUID foreign key to users table
- **date**: Date of availability
- **start_time**: Start time for availability
- **end_time**: End time for availability
- **appointment_duration**: Standard appointment duration
- **max_patients**: Maximum patients for time slot
- **is_available**: Boolean for availability status
- **created_at**: Availability creation timestamp
- **updated_at**: Last update timestamp
- **recurrence_pattern**: JSONB for recurring availability patterns

### Medical Records Schema

#### Medical Records Table
- **id**: UUID primary key
- **tenant_id**: UUID foreign key for tenant association
- **patient_id**: UUID foreign key to patients table
- **doctor_id**: UUID foreign key to users table (creating doctor)
- **record_type**: Type of record (consultation, test_result, prescription)
- **title**: Record title or subject
- **content**: JSONB for medical record content
- **chief_complaint**: Patient's chief complaint
- **symptoms**: JSONB for symptoms description
- **diagnosis**: JSONB for diagnosis information
- **treatment**: JSONB for treatment plan
- **vital_signs**: JSONB for vital signs data
- **medications**: JSONB for prescribed medications
- **follow_up_date**: Recommended follow-up date
- **is_sensitive**: Boolean for sensitive record flag
- **requires_auth**: Boolean for additional authentication
- **created_at**: Record creation timestamp
- **updated_at**: Last update timestamp
- **created_by**: UUID of user who created record
- **updated_by**: UUID of user who last updated record

#### Medical Record Attachments Table
- **id**: UUID primary key
- **medical_record_id**: UUID foreign key to medical_records table
- **tenant_id**: UUID foreign key for tenant association
- **file_name**: Original file name
- **file_path**: Storage path for file
- **file_type**: Type of file (pdf, jpg, dicom, etc.)
- **file_size**: File size in bytes
- **mime_type**: MIME type of file
- **uploaded_by**: UUID of user who uploaded file
- **uploaded_at**: File upload timestamp
- **is_encrypted**: Boolean for encryption status
- **checksum**: File checksum for integrity

### Prescription Management Schema

#### Prescriptions Table
- **id**: UUID primary key
- **tenant_id**: UUID foreign key for tenant association
- **patient_id**: UUID foreign key to patients table
- **doctor_id**: UUID foreign key to users table (prescribing doctor)
- **medical_record_id**: UUID foreign key to medical_records table
- **prescription_number**: Unique prescription number
- **medication_name**: Name of medication
- **dosage**: Dosage information (e.g., 500mg)
- **frequency**: Frequency of administration
- **duration**: Duration of prescription
- **quantity**: Quantity prescribed
- **refills_remaining**: Number of refills remaining
- **instructions**: Administration instructions
- **pharmacy_notes**: Notes for pharmacy
- **status**: Prescription status (active, filled, expired)
- **written_date**: Date prescription was written
- **expires_date**: Prescription expiration date
- **created_at**: Prescription creation timestamp
- **updated_at**: Last update timestamp
- **created_by**: UUID of user who created prescription

#### Prescription Refills Table
- **id**: UUID primary key
- **prescription_id**: UUID foreign key to prescriptions table
- **tenant_id**: UUID foreign key for tenant association
- **refill_number**: Refill sequence number
- **filled_date**: Date refill was filled
- **pharmacy_id**: Pharmacy identifier
- **filled_by**: UUID of user who processed refill
- **quantity_dispensed**: Quantity dispensed
- **refill_status**: Status of refill (requested, filled, denied)
- **notes**: Notes about refill
- **created_at**: Refill request timestamp
- **updated_at**: Last update timestamp

### Audit and Compliance Schema

#### Audit Logs Table
- **id**: UUID primary key
- **tenant_id**: UUID foreign key for tenant association
- **user_id**: UUID foreign key to users table
- **action**: Action performed (CREATE, READ, UPDATE, DELETE)
- **resource_type**: Type of resource accessed
- **resource_id**: ID of resource accessed
- **details**: JSONB for additional audit details
- **ip_address**: IP address of request
- **user_agent**: Browser user agent
- **timestamp**: Action timestamp
- **outcome**: Action outcome (success, failure)
- **phi_accessed**: Boolean indicating PHI access
- **access_reason**: Reason for PHI access
- **session_id**: Session identifier

#### Compliance Reports Table
- **id**: UUID primary key
- **tenant_id**: UUID foreign key for tenant association
- **report_type**: Type of compliance report
- **report_period**: Reporting period
- **generated_by**: UUID of user who generated report
- **report_data**: JSONB for report data
- **file_path**: Path to generated report file
- **generated_at**: Report generation timestamp
- **status**: Report status (generating, completed, failed)

## Database Performance Optimization

### Indexing Strategy

#### Primary Indexes
- **UUID Primary Keys**: All tables use UUID primary keys with btree indexes
- **Foreign Key Indexes**: All foreign keys have btree indexes
- **Tenant Indexes**: tenant_id columns indexed for multi-tenant queries
- **Timestamp Indexes**: created_at, updated_at columns indexed

#### Specialized Indexes
- **Medical Record Search**: GIN indexes on JSONB content fields
- **Appointment Scheduling**: Composite indexes on date/time columns
- **Patient Search**: GIN indexes on patient name fields
- **Audit Log Queries**: Composite indexes on timestamp, user_id, action

#### Partitioning Strategy
- **Audit Logs**: Partition by month for large audit tables
- **Medical Records**: Partition by tenant_id for large tenants
- **Appointments**: Partition by date for historical data

### Query Optimization

#### Common Query Patterns
- **Patient Lookup**: Optimized queries for patient search and retrieval
- **Medical Record Search**: Full-text search on medical record content
- **Appointment Scheduling**: Efficient availability checking
- **Audit Log Queries**: Optimized compliance reporting queries
- **Dashboard Data**: Aggregated queries for dashboard performance

#### Materialized Views
- **Patient Statistics**: Pre-computed patient demographics
- **Appointment Metrics**: Appointment scheduling analytics
- **Provider Performance**: Doctor performance metrics
- **Compliance Summaries**: HIPAA compliance reporting data

## Database Security Design

### Data Encryption

#### Encryption at Rest
- **Database Encryption**: Transparent data encryption (TDE)
- **Column Encryption**: Sensitive columns encrypted with application-level encryption
- **File Encryption**: Medical files encrypted in storage
- **Backup Encryption**: Database backups encrypted

#### Encryption in Transit
- **SSL/TLS**: All database connections encrypted
- **Application Encryption**: Sensitive data encrypted before storage
- **Key Management**: Secure key rotation and management

### Access Control

#### Database Security
- **Row-Level Security**: RLS policies for tenant isolation
- **Database Roles**: Granular database role permissions
- **Connection Security**: Secure connection requirements
- **Audit Logging**: Database access logging

#### Application Security
- **Connection Pooling**: Secure connection management
- **Query Filtering**: Automatic tenant_id filtering
- **Parameterized Queries**: SQL injection prevention
- **Input Validation**: Data validation and sanitization

## Database Backup and Recovery

### Backup Strategy

#### Backup Types
- **Full Backups**: Weekly full database backups
- **Incremental Backups**: Daily incremental backups
- **WAL Archiving**: Continuous write-ahead log archiving
- **Cross-Region Backup**: Backup replication to different regions

#### Backup Security
- **Encryption**: All backups encrypted
- **Access Control**: Secure backup access management
- **Retention**: Backup retention policies
- **Verification**: Regular backup verification

### Recovery Strategy

#### Recovery Scenarios
- **Point-in-Time Recovery**: WAL-based point-in-time recovery
- **Database Restoration**: Full database restoration procedures
- **Partial Recovery**: Selective data recovery
- **Disaster Recovery**: Complete disaster recovery plan

#### Recovery Testing
- **Regular Testing**: Monthly recovery testing
- **Documentation**: Recovery procedure documentation
- **Performance**: Recovery time objective validation
- **Verification**: Data integrity verification

## Database Monitoring and Maintenance

### Performance Monitoring

#### Key Metrics
- **Query Performance**: Slow query identification and optimization
- **Connection Metrics**: Connection pool utilization
- **Resource Usage**: CPU, memory, disk utilization
- **Index Usage**: Index effectiveness analysis

#### Monitoring Tools
- **PostgreSQL Statistics**: Built-in performance statistics
- **Query Analysis**: Query performance analysis tools
- **Custom Metrics**: Healthcare-specific performance metrics
- **Alerting**: Performance threshold alerting

### Maintenance Procedures

#### Regular Maintenance
- **Vacuum and Analyze**: Regular table maintenance
- **Index Rebuilding**: Index optimization procedures
- **Statistics Update**: Query planner statistics
- **Log Rotation**: Log file management

#### Data Lifecycle
- **Archive Strategy**: Historical data archiving
- **Cleanup Procedures**: Automated data cleanup
- **Retention Policies**: Data retention enforcement
- **Compliance Deletion**: HIPAA-compliant data deletion

## Integration and Migration

### External System Integration

#### Healthcare Systems
- **EHR Integration**: Electronic health record system integration
- **Lab Systems**: Laboratory information system integration
- **Pharmacy Systems**: Pharmacy management system integration
- **Insurance Systems**: Insurance verification integration

#### Integration Patterns
- **API Integration**: RESTful API integration patterns
- **Data Synchronization**: Real-time data synchronization
- **Batch Processing**: Bulk data processing procedures
- **Error Handling**: Integration error handling and recovery

### Data Migration

#### Migration Strategy
- **Schema Migration**: Alembic migration management
- **Data Migration**: Legacy data migration procedures
- **Validation**: Data validation and verification
- **Rollback**: Migration rollback procedures

#### Migration Tools
- **ETL Processes**: Extract, transform, load procedures
- **Data Validation**: Data quality validation tools
- **Performance**: Migration performance optimization
- **Monitoring**: Migration progress monitoring

## Deliverables

### Primary Deliverables
1. **Complete Database Schema** with all tables and relationships
2. **Migration Scripts** for database setup and updates
3. **Performance Optimization** with indexes and query optimization
4. **Security Implementation** with encryption and access control
5. **Backup and Recovery** procedures and automation
6. **Monitoring and Maintenance** procedures and tools
7. **Integration Framework** for external healthcare systems
8. **Documentation** with complete database architecture guide

### Documentation Deliverables
1. **Database Architecture Document** with design rationale
2. **Schema Documentation** with table and column descriptions
3. **Performance Guide** with optimization procedures
4. **Security Guide** with security implementation details
5. **Backup and Recovery Guide** with procedures and schedules
6. **Integration Guide** with external system integration details
7. **Maintenance Guide** with regular maintenance procedures
8. **Troubleshooting Guide** with common issues and solutions

Create a comprehensive database architecture that provides secure, scalable, and high-performance data storage for the healthcare platform while maintaining strict HIPAA compliance and supporting complex healthcare workflows.
