## 1. Backend Lifecycle Rules

- [x] 1.1 Define canonical order statuses and allowed transition map in `backend/models.py`
- [x] 1.2 Add shared transition validation helper used by the order service to reject illegal status changes with clear error messages
- [x] 1.3 Add or update request/response models needed for status transition payload validation

## 2. Backend API Integration

- [x] 2.1 Implement a single order status transition endpoint that routes all status updates through service validation
- [x] 2.2 Route cancellation behavior through the same transition endpoint while enforcing pending-only cancellation
- [x] 2.3 Update API error handling to return consistent client-facing errors for invalid transitions and missing orders

## 3. Frontend Queue Actions

- [x] 3.1 Update queue rendering logic to compute inline action buttons from each order's current status
- [x] 3.2 Implement frontend status transition calls for prepare, ready, complete, and cancel actions
- [x] 3.3 Show clear UI feedback when transition requests fail and keep local order status unchanged until refresh

## 4. Frontend Queue Grouping

- [x] 4.1 Render queue board in grouped lifecycle sections including a visible Completed section
- [x] 4.2 Ensure completed orders remain listed in Completed after successful transition
- [x] 4.3 Verify cancelled and completed orders do not render advance controls

## 5. Validation and Regression Checks

- [x] 5.1 Add or update backend tests for valid and invalid lifecycle transitions and pending-only cancellation
- [x] 5.2 Add or update frontend behavior checks for status-specific actions and grouped queue rendering
- [ ] 5.3 Run project checks and manually validate end-to-end order progression in the queue UI
