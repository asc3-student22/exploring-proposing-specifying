## Purpose
Define queue UI behavior for lifecycle-specific actions, grouping, and transition error handling.

## Requirements

### Requirement: Queue UI SHALL present status-specific inline actions
The queue board SHALL render inline action controls for each order based on current status. `pending` orders MUST show actions to advance to `preparing` and to cancel. `preparing` orders MUST show an action to advance to `ready`. `ready` orders MUST show an action to advance to `completed`. `completed` and `cancelled` orders MUST not show advance actions.

#### Scenario: Pending order actions
- **GIVEN** an order in the queue has status `pending`
- **WHEN** the queue renders an order with status `pending`
- **THEN** the UI shows an advance action for `preparing` and a cancel action

#### Scenario: Completed order actions
- **GIVEN** an order in the queue has status `completed`
- **WHEN** the queue renders an order with status `completed`
- **THEN** the UI shows no advance or cancel action controls

### Requirement: Queue UI SHALL group orders by lifecycle state
The queue board SHALL display grouped sections for lifecycle statuses and include a visible Completed section where completed orders remain listed.

#### Scenario: Completed group visibility
- **GIVEN** at least one order has status `completed`
- **WHEN** at least one order has status `completed`
- **THEN** the queue displays a Completed group containing that order

#### Scenario: Progression updates group placement
- **GIVEN** an order is currently shown in the `ready` group
- **WHEN** an order is advanced from `ready` to `completed`
- **THEN** the next queue refresh displays the order in the Completed group

### Requirement: Queue UI SHALL handle invalid transitions clearly
If a status transition request fails validation, the UI SHALL present an error message and preserve the existing displayed order status until a successful refresh.

#### Scenario: Transition rejection feedback
- **GIVEN** an order is displayed in the queue and a user triggers a status action
- **WHEN** a user attempts a transition that the backend rejects as invalid
- **THEN** the UI displays a clear error message and does not apply a local status change

#### Scenario: Stale queue action rejected by backend
- **GIVEN** the UI shows an action for an order whose status changed on another client
- **WHEN** a user triggers the stale action and the backend rejects the transition as invalid flow
- **THEN** the UI shows an invalid-flow error and refreshes the order list to reflect the current backend status
