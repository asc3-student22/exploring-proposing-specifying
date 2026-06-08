## Why

The order domain model already defines a multi-stage lifecycle, but the running system only supports `pending` and `cancelled` in practice. Adding explicit lifecycle progression now closes this behavior gap, improves operational visibility in the queue, and prevents fragile status updates with clear transition rules.

## What Changes

- Add a canonical backend order lifecycle with explicit allowed transitions.
- Add one status-transition API endpoint used for all order state updates, including cancellation.
- Validate transitions and return clear errors for invalid status changes.
- Keep cancellation restricted to orders that are currently `pending`.
- Update the existing queue UI to show inline status actions based on each order's current state.
- Group queue rendering by status and keep completed orders visible in a dedicated Completed section.

## Capabilities

### New Capabilities
- `order-status-lifecycle`: Defines allowed order statuses, transition validation, and status transition API behavior.
- `order-status-ui`: Defines queue UI actions and grouped display behavior for lifecycle progression.

### Modified Capabilities
- None.

## Impact

- Backend files in `backend/services/orders.py`, `backend/models.py`, and `backend/app.py` will be updated to support validated transitions and endpoint handling.
- Frontend files in `frontend/script.js` and related queue rendering logic will be updated for status-specific actions and grouped display.
- API surface changes from cancel-only behavior to a unified status transition endpoint.
- No new persistence layer or external dependencies are required.
