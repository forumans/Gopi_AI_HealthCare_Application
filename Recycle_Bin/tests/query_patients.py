#!/usr/bin/env python3
"""Simple script to query patient data directly from the database"""

import asyncio
import os
import sys
from pathlib import Path

# Add the server directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent / "server"))

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from app.models import Patient, Tenant


async def query_patients():
    """Query patients with names starting with 'Patient'"""
    
    # Use the same database URL as the existing test
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://healthcare_user:password@localhost:5432/healthcare_saas",
    )
    
    # Create async engine
    engine = create_async_engine(database_url, future=True, pool_pre_ping=True)
    
    try:
        async with engine.begin() as conn:
            # Get the first tenant
            tenant_stmt = text("SELECT * FROM tenants LIMIT 1")
            tenant_result = await conn.execute(tenant_stmt)
            tenant_row = tenant_result.first()
            
            if not tenant_row:
                print("❌ No tenants found in the database")
                return
            
            # Convert row to dict
            tenant = dict(tenant_row._mapping)
            
            print(f"✅ Using tenant: {tenant['id']}")
            print(f"   Tenant name: {tenant.get('name', 'N/A')}")
            print()
            
            # Query patients using raw SQL
            patient_sql = text("""
                SELECT * FROM patients 
                WHERE tenant_id = :tenant_id 
                AND deleted_at IS NULL 
                AND full_name LIKE 'Patient%'
                ORDER BY full_name
            """)
            
            patient_result = await conn.execute(patient_sql, {"tenant_id": tenant['id']})
            patient_rows = patient_result.all()
            
            if not patient_rows:
                print("❌ No patients found with names starting with 'Patient'")
                return
            
            print(f"✅ Found {len(patient_rows)} patients:")
            print()
            
            for i, row in enumerate(patient_rows, 1):
                patient = dict(row._mapping)
                print(f"Patient {i}:")
                print(f"  ID: {patient['id']}")
                print(f"  Name: {patient['full_name']}")
                print(f"  Date of Birth: {patient['date_of_birth']}")
                print(f"  Gender: {patient['gender']}")
                print(f"  Phone: {patient['phone']}")
                print(f"  User ID: {patient['user_id']}")
                print(f"  Address:")
                print(f"    Line 1: {patient['address_line1']}")
                print(f"    Line 2: {patient['address_line2']}")
                print(f"    City: {patient['city']}")
                print(f"    State: {patient['state']}")
                print(f"    Postal Code: {patient['postal_code']}")
                print(f"    Country: {patient['country']}")
                print(f"  Insurance:")
                print(f"    Provider: {patient['insurance_provider']}")
                print(f"    Policy Number: {patient['insurance_policy_number']}")
                print(f"  Created At: {patient['created_at']}")
                print("-" * 50)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    print("🔍 Querying patient data from database...")
    print("=" * 50)
    
    try:
        asyncio.run(query_patients())
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
