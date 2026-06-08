import unittest
from fastapi.testclient import TestClient

from backend.app import app
from backend.services.menu import MenuService
from backend.services.orders import OrderService


class OrderLifecycleAPITest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        menu_service = MenuService()
        app.state.order_service = OrderService(menu_service)

        # Swap module-level singleton for isolated test state.
        import backend.app as app_module
        app_module.order_service = app.state.order_service

    def place_default_order(self):
        response = self.client.post(
            "/api/orders",
            json={"item_id": "neural-latte", "size": "medium"},
        )
        self.assertEqual(response.status_code, 200)
        return response.json()["order"]["order_id"]

    def transition(self, order_id, status):
        return self.client.patch(
            f"/api/orders/{order_id}/status",
            json={"status": status},
        )

    def test_valid_forward_lifecycle_transition(self):
        order_id = self.place_default_order()

        response = self.transition(order_id, "preparing")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["order"]["status"], "preparing")

        response = self.transition(order_id, "ready")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["order"]["status"], "ready")

        response = self.transition(order_id, "completed")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["order"]["status"], "completed")

    def test_invalid_transition_is_rejected(self):
        order_id = self.place_default_order()

        response = self.transition(order_id, "ready")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Cannot transition", response.json()["detail"])

    def test_pending_only_cancellation(self):
        order_id = self.place_default_order()

        response = self.transition(order_id, "cancelled")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["order"]["status"], "cancelled")

        next_order = self.place_default_order()
        self.assertEqual(self.transition(next_order, "preparing").status_code, 200)

        response = self.transition(next_order, "cancelled")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Cannot transition", response.json()["detail"])

    def test_invalid_status_payload_is_rejected(self):
        order_id = self.place_default_order()

        response = self.transition(order_id, "brewing")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid status", response.json()["detail"])

    def test_missing_order_returns_404(self):
        response = self.transition(99999, "preparing")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Order not found")


if __name__ == "__main__":
    unittest.main()
