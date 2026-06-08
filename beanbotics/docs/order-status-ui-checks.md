# Order Status UI Behavior Checks

This checklist validates status-specific actions and grouped queue rendering in the browser.

## Status Action Checks

1. Place a new order and verify it appears in Pending with:
   - Start Preparing action
   - Cancel action
2. Click Start Preparing and verify the order moves to Preparing with only Mark Ready action.
3. Click Mark Ready and verify the order moves to Ready with only Complete action.
4. Click Complete and verify the order moves to Completed with no action buttons.
5. Attempt to cancel from Preparing/Ready and verify UI shows a validation error message.

## Grouping Checks

1. Verify orders are shown in lifecycle groups: Pending, Preparing, Ready, Completed, Cancelled.
2. Verify Completed group remains visible when completed orders exist.
3. Verify cancelled and completed orders do not show advance actions.

## Error Handling Checks

1. Trigger an invalid transition from a stale tab/client.
2. Verify UI shows an invalid-flow error and refreshes the order list.
3. Verify the displayed status stays consistent with backend after refresh.
