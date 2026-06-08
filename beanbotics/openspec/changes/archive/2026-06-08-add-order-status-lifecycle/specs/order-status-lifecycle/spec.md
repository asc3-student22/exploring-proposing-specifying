## ADDED Requirements

### Requirement: Backend SHALL enforce a canonical order lifecycle
The system SHALL define and enforce a canonical status lifecycle for orders using the statuses `pending`, `preparing`, `ready`, `completed`, and `cancelled`. Allowed transitions MUST be limited to `pending -> preparing -> ready -> completed` and `pending -> cancelled`.

#### Scenario: Valid transition request
- **GIVEN** an existing order is currently in `preparing` status
- **WHEN** a client requests a transition from `preparing` to `ready`
- **THEN** the backend updates the order status to `ready`

#### Scenario: Invalid transition request
- **GIVEN** an existing order is currently in `ready` status
- **WHEN** a client requests a transition from `ready` to `preparing`
- **THEN** the backend rejects the request with a validation error indicating the transition is not allowed

#### Scenario: Skipping a lifecycle stage is rejected
- **GIVEN** an existing order is currently in `pending` status
- **WHEN** a client requests a transition from `pending` to `ready`
- **THEN** the backend rejects the request with a validation error indicating that stage skipping is not allowed

#### Scenario: Skipping from pending to completed is rejected
- **GIVEN** an existing order is currently in `pending` status
- **WHEN** a client requests a transition from `pending` to `completed`
- **THEN** the backend rejects the request with a validation error indicating that stage skipping is not allowed

#### Scenario: Skipping from preparing to completed is rejected
- **GIVEN** an existing order is currently in `preparing` status
- **WHEN** a client requests a transition from `preparing` to `completed`
- **THEN** the backend rejects the request with a validation error indicating that stage skipping is not allowed

#### Scenario: Reverse transition from preparing to pending is rejected
- **GIVEN** an existing order is currently in `preparing` status
- **WHEN** a client requests a transition from `preparing` to `pending`
- **THEN** the backend rejects the request with a validation error indicating the transition is not allowed

#### Scenario: Reverse transition from ready to pending is rejected
- **GIVEN** an existing order is currently in `ready` status
- **WHEN** a client requests a transition from `ready` to `pending`
- **THEN** the backend rejects the request with a validation error indicating the transition is not allowed

#### Scenario: Transition from completed is rejected
- **GIVEN** an existing order is currently in `completed` status
- **WHEN** a client requests any further status transition
- **THEN** the backend rejects the request with a validation error indicating completed orders are terminal

#### Scenario: Transition from cancelled is rejected
- **GIVEN** an existing order is currently in `cancelled` status
- **WHEN** a client requests any further status transition
- **THEN** the backend rejects the request with a validation error indicating cancelled orders are terminal

### Requirement: Backend SHALL provide one status transition API for order updates
The system SHALL expose one API endpoint for order status transitions, and all status changes including cancellation MUST be processed through this endpoint.

#### Scenario: Cancellation through transition endpoint
- **GIVEN** an existing order is currently in `pending` status
- **WHEN** a client requests a transition from `pending` to `cancelled`
- **THEN** the request is processed by the status transition endpoint and the order status becomes `cancelled`

#### Scenario: Advance through transition endpoint
- **GIVEN** an existing order is currently in `ready` status
- **WHEN** a client requests a transition from `ready` to `completed`
- **THEN** the request is processed by the same status transition endpoint and the order status becomes `completed`

#### Scenario: Unsupported target status is rejected
- **GIVEN** an existing order is currently in `pending` status
- **WHEN** a client requests a transition to an unsupported status value
- **THEN** the status transition endpoint rejects the request with a validation error for invalid status

### Requirement: Backend SHALL restrict cancellation to pending orders
The system MUST only permit cancellation for orders currently in `pending` status.

#### Scenario: Pending order cancellation
- **GIVEN** an existing order is currently in `pending` status
- **WHEN** a client requests transition of a `pending` order to `cancelled`
- **THEN** the backend accepts the request and stores the order as `cancelled`

#### Scenario: Non-pending cancellation attempt
- **GIVEN** an existing order is currently in `preparing` status
- **WHEN** a client requests transition of a `preparing` order to `cancelled`
- **THEN** the backend rejects the request with a validation error describing that cancellation is only allowed from `pending`

#### Scenario: Ready order cancellation attempt
- **GIVEN** an existing order is currently in `ready` status
- **WHEN** a client requests transition of a `ready` order to `cancelled`
- **THEN** the backend rejects the request with a validation error describing that cancellation is only allowed from `pending`
