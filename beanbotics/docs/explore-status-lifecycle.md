# Draft Proposal Summary: Order Status Lifecycle

## Problem
The order model documents five statuses (`pending`, `preparing`, `ready`, `completed`, `cancelled`), but the current implementation only uses `pending` and `cancelled` in practice. There is no backend path to advance an order through preparation, ready-for-pickup, and completion, and the frontend queue does not support lifecycle progression beyond canceling pending orders.

This creates a mismatch between the intended domain model and actual behavior, limits operational visibility for active orders, and makes status handling fragile because transitions are not explicitly modeled or validated.

## Proposed Solution
Implement an explicit order lifecycle with validated transitions and UI controls to move orders through each stage.

### Lifecycle
- `pending -> preparing -> ready -> completed`
- `pending -> cancelled`

### Backend
- Introduce a canonical set of allowed statuses and a transition map.
- Expose a single status-transition endpoint for all updates (including cancellation).
- Validate every requested transition against the transition map.
- Reject invalid transitions with clear API errors.
- Keep cancellation restricted to orders currently in `pending`.

### Frontend
- Keep controls in the existing queue UI (no separate staff view).
- Render inline action buttons per order based on current status:
  - `pending`: advance to `preparing`, or cancel
  - `preparing`: advance to `ready`
  - `ready`: advance to `completed`
  - `completed` and `cancelled`: no advance actions
- Display orders grouped on the queue board, including a visible `Completed` group where completed orders remain listed.

## Scope
- Add backend status-transition validation using a transition map.
- Add one endpoint for all status transitions.
- Keep current cancellation rule: pending only.
- Update frontend queue rendering to show status-specific inline actions.
- Group queue display to keep completed orders visible in a dedicated `Completed` section.

## Out of Scope
- Separate staff/admin interface.
- Automatic timer-based status progression.
- Role-based authorization for who can transition orders.
- Persistence redesign or historical analytics beyond existing in-memory model.
- Notification systems (SMS, push, email, etc.).

## Risks
- **State drift between clients:** Multiple users may attempt conflicting transitions; invalid transition handling and refresh behavior must be clear.
- **UI complexity growth:** Inline controls and grouped views add rendering logic that can become brittle without tests.
- **Backward compatibility:** Existing clients using cancel-only behavior may need graceful handling if endpoint contracts change.
- **Rule ambiguity:** Any unclear edge cases (for example, whether cancelled orders are displayed and where) can produce inconsistent UX if not codified.
- **Operational confusion during rollout:** Users accustomed to simple pending/cancel behavior may need clear labels and affordances for new stages.
