# 08-Audit Log Viewer
Create a secure audit log viewer for Admin role.

API:
GET /audit-logs?table=&date_from=&date_to=

DISPLAY:
- Action type
- Timestamp
- Performed by
- Table name
- Expandable JSON diff view

SECURITY:
- Read-only
- Mask sensitive fields
- Export CSV option

OUTPUT:
Generate Gradio audit viewer.