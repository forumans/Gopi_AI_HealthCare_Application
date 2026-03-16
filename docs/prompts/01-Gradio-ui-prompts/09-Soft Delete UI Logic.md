Implement soft delete behavior in UI.

Instead of DELETE:
Call PATCH /resource/{id}/soft-delete

UI BEHAVIOR:
- Show confirmation dialog
- After delete:
   - Hide from normal view
   - Allow admin to view deleted records
- Show "Restore" option (PATCH /resource/{id}/restore)

OUTPUT:
Generate reusable soft delete logic component.
