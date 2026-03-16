# 02-Multi Tenant Architecture
Implement a secure multi-tenant architecture.

Requirements:
- Each request scoped by tenant_id
- Extract tenant from JWT
- Prevent cross-tenant data leakage
- Row-level security
- Tenant-specific configurations
- Admin can only see their tenant
- Super-admin can see all tenants

Generate:
- Middleware
- Dependency injection
- SQLAlchemy tenant filtering strategy
- Row-level security policies
