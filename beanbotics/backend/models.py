"""
BeanBotics Data Models

Data structures for the BeanBotics coffee ordering system.
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


ORDER_STATUSES = {"pending", "preparing", "ready", "completed", "cancelled"}

ORDER_TRANSITIONS = {
    "pending": {"preparing", "cancelled"},
    "preparing": {"ready"},
    "ready": {"completed"},
    "completed": set(),
    "cancelled": set(),
}


def is_valid_order_status(status: str) -> bool:
    return status in ORDER_STATUSES


def can_transition_order_status(current_status: str, target_status: str) -> bool:
    if current_status not in ORDER_TRANSITIONS:
        return False
    return target_status in ORDER_TRANSITIONS[current_status]


@dataclass
class MenuItem:
    id: str
    name: str
    description: str
    category: str
    sizes: Dict[str, Dict[str, Any]]


@dataclass
class Order:
    order_id: int
    items: List[str]
    total_price: float
    status: str  # pending, preparing, ready, completed, cancelled
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
