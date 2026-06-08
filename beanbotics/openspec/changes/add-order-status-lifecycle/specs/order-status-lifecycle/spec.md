## ADDED Requirements

### Requirement: Backend SHALL enforce a canonical order lifecycle
The system SHALL define and enforce a canonical status lifecycle for orders using the statuses `pending`, `preparing`, `ready`, `completed`, and `cancelled`. Allowed transitions MUST be limited to `pending -> preparing -> ready -> completed` and `pending -> cancelled`.

#### Scenario: Valid transition request
- **WHEN** a client requests a transition from `preparing` to `ready`
- **THEN** the backend updates the order status to `ready`

#### Scenario: Invalid transition request
- **WHEN** a client requests a transition from `ready` to `preparing`
- **THEN** the backend rejects the request with a validation error indicating the transition is not allowed

### Requirement: Backend SHALL provide one status transition API for order updates
The system SHALL expose one API endpoint for order status transitions, and all status changes including cancellation MUST be processed through this endpoint.

#### Scenario: Cancellation through transition endpoint
- **WHEN** a client requests a transition from `pending` to `cancelled`
- **THEN** the request is processed by the status transition endpoint and the order status becomes `cancelled`

#### Scenario: Advance through transition endpoint
- **WHEN** a client requests a transition from `ready` to `completed`
- **THEN** the request is processed by the same status transition endpoint and the order status becomes `completed`

### Requirement: Backend SHALL restrict cancellation to pending orders
The system MUST only permit cancellation for orders currently in `pending` status.

#### Scenario: Pending order cancellation
- **WHEN** a client requests transition of a `pending` order to `cancelled`
- **THEN** the backend accepts the request and stores the order as `cancelled`

#### Scenario: Non-pending cancellation attempt
- **WHEN** a client requests transition of a `preparing` order to `cancelled`
- **THEN** the backend rejects the request with a validation error describing that cancellation is only allowed from `pending`
