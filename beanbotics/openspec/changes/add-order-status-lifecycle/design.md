## Context

The current order model in BeanBotics includes five statuses (`pending`, `preparing`, `ready`, `completed`, `cancelled`), but active behavior only supports creating pending orders and cancelling pending orders. This mismatch leaves the queue without explicit progression states and makes status handling inconsistent between model intent and runtime behavior.

This change is cross-cutting: backend service logic must enforce a legal transition graph, API behavior must expose a single transition path, and frontend queue controls must present status-appropriate actions while keeping completed orders visible.

## Goals / Non-Goals

**Goals:**
- Define one canonical lifecycle transition graph in backend code.
- Enforce transition validation for every status update request.
- Provide one status transition API route for all status changes, including cancellation.
- Render queue actions in the existing UI based on per-order status.
- Group queue display by lifecycle state and keep a visible Completed section.

**Non-Goals:**
- Introduce a separate staff/admin app.
- Add timer-based automatic transitions.
- Add user roles or authorization rules.
- Replace in-memory order storage with durable persistence.
- Add notifications or analytics workflows.

## Decisions

### Decision: Centralize transition rules in service layer constants
- Choice: Define an allowed-status set and transition map in `backend/services/orders.py`, and expose a single validation function for status updates.
- Rationale: Keeping transitions centralized prevents drift across endpoints and avoids duplicated rule logic.
- Alternative considered: Validate transitions inline in API route handlers.
- Why not alternative: Route-level logic would spread lifecycle policy across files and increase regression risk.

### Decision: Replace cancel-only mutation with one status transition endpoint
- Choice: Introduce one API endpoint for status updates (for example PATCH-style semantics), and route cancel through the same transition logic.
- Rationale: A unified endpoint makes client behavior explicit and supports consistent validation/error handling.
- Alternative considered: Keep DELETE for cancellation and add a separate advance endpoint.
- Why not alternative: Multiple mutation endpoints create overlapping semantics and require duplicated validation paths.

### Decision: Preserve strict cancellation rule (pending only)
- Choice: Keep cancellation valid only from `pending`.
- Rationale: This aligns with current domain expectations and avoids ambiguous behavior for in-progress or finished work.
- Alternative considered: Allow cancellation from `preparing`.
- Why not alternative: It introduces operational ambiguity and complicates queue expectations without a business requirement.

### Decision: Frontend computes actions from current status
- Choice: Queue rendering generates inline controls by status (`pending`: prepare + cancel, `preparing`: ready, `ready`: complete).
- Rationale: Status-derived UI behavior prevents invalid actions from being presented.
- Alternative considered: Render all controls and rely only on backend validation.
- Why not alternative: Exposing impossible actions degrades UX and increases avoidable API errors.

### Decision: Group queue sections by status with persistent completed visibility
- Choice: Render grouped sections including Completed and keep completed orders listed.
- Rationale: Operators can track progression and verify completion without losing context.
- Alternative considered: Hide completed orders after completion.
- Why not alternative: It reduces short-term visibility and complicates verification during active operations.

## Risks / Trade-offs

- Concurrent client updates may issue conflicting transitions -> Mitigation: backend rejects invalid transitions and frontend refreshes queue state after each mutation.
- Grouped queue UI increases rendering logic complexity -> Mitigation: keep section rendering deterministic from a status-order map and reuse one action builder.
- Existing clients expecting cancel-only behavior may break on endpoint contract changes -> Mitigation: provide clear API error messages and update frontend calls atomically with backend change.
- Keeping completed orders visible can increase visual noise over long sessions -> Mitigation: keep completed section last and preserve concise card styling.

## Migration Plan

1. Add transition constants and validation logic in order service.
2. Add the unified status transition endpoint and wire cancellation behavior through it.
3. Update frontend queue actions to call the new endpoint and refresh board state.
4. Deploy backend and frontend together to avoid temporary contract mismatch.
5. If rollback is needed, revert frontend action calls and restore prior cancel endpoint behavior in backend.

## Open Questions

- Should cancelled orders appear in a dedicated section or remain in their existing ordering with a cancelled badge?
- Should completed orders remain indefinitely in memory or only for the runtime session (current default behavior)?
