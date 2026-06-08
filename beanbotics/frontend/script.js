const API = "";

async function loadMenu() {
    const container = document.getElementById("menu-list");
    try {
        const res = await fetch(`${API}/api/menu`);
        const data = await res.json();
        container.innerHTML = "";

        data.items.forEach((item) => {
            const card = document.createElement("div");
            card.className = "menu-card";

            const sizesHtml = Object.entries(item.sizes)
                .map(
                    ([size, info]) =>
                        `<label class="size-option">
                            <input type="radio" name="size-${item.id}" value="${size}"
                                data-price="${info.price}"
                                ${size === "medium" ? "checked" : ""}>
                            <span class="size-label">${size.charAt(0).toUpperCase() + size.slice(1)}</span>
                            <span class="size-price">$${info.price.toFixed(2)}</span>
                        </label>`
                )
                .join("");

            const defaultPrice = item.sizes.medium
                ? item.sizes.medium.price.toFixed(2)
                : Object.values(item.sizes)[0].price.toFixed(2);

            card.innerHTML = `
                <h3>${item.name}</h3>
                <p class="description">${item.description}</p>
                <div class="size-selector">
                    ${sizesHtml}
                </div>
                <button class="order-btn" onclick="placeOrder('${item.id}')">
                    Order — $<span id="price-${item.id}">${defaultPrice}</span>
                </button>
            `;
            container.appendChild(card);

            // Update displayed price when size selection changes
            card.querySelectorAll(`input[name="size-${item.id}"]`).forEach(
                (radio) => {
                    radio.addEventListener("change", () => {
                        const priceSpan = document.getElementById(
                            `price-${item.id}`
                        );
                        priceSpan.textContent =
                            parseFloat(radio.dataset.price).toFixed(2);
                    });
                }
            );
        });
    } catch (err) {
        container.innerHTML = `<p class="empty-state">Failed to load menu.</p>`;
    }
}

async function placeOrder(itemId) {
    const selectedRadio = document.querySelector(
        `input[name="size-${itemId}"]:checked`
    );
    const size = selectedRadio ? selectedRadio.value : "medium";

    try {
        const res = await fetch(`${API}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_id: itemId, size: size }),
        });
        if (!res.ok) throw new Error("Order failed");
        await loadOrders();
    } catch (err) {
        alert("Failed to place order: " + err.message);
    }
}

function statusDisplayLabel(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function orderActionsForStatus(order) {
    if (order.status === "pending") {
        return `
            <button class="action-btn" onclick="transitionOrder(${order.order_id}, 'preparing')">Start Preparing</button>
            <button class="cancel-btn" onclick="transitionOrder(${order.order_id}, 'cancelled')">Cancel</button>
        `;
    }

    if (order.status === "preparing") {
        return `<button class="action-btn" onclick="transitionOrder(${order.order_id}, 'ready')">Mark Ready</button>`;
    }

    if (order.status === "ready") {
        return `<button class="action-btn" onclick="transitionOrder(${order.order_id}, 'completed')">Complete</button>`;
    }

    return "";
}

function renderOrderCard(order) {
    return `
        <div class="order-item">
            <div class="order-info">
                <span class="order-id">#${order.order_id}</span>
                <span class="order-items">${order.items.join(", ")}</span>
                <span class="order-price">$${order.total_price.toFixed(2)}</span>
            </div>
            <span class="order-status status-${order.status}">${statusDisplayLabel(order.status)}</span>
            <div class="order-actions">
                ${orderActionsForStatus(order)}
            </div>
        </div>
    `;
}

function renderOrderGroup(title, orders) {
    if (!orders.length) {
        return "";
    }

    return `
        <div class="order-group">
            <h3>${title}</h3>
            ${orders.map((order) => renderOrderCard(order)).join("")}
        </div>
    `;
}

async function transitionOrder(orderId, targetStatus) {
    try {
        const res = await fetch(`${API}/api/orders/${orderId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: targetStatus }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Status update failed");
        }

        await loadOrders();
    } catch (err) {
        alert("Failed to update order status: " + err.message);
        // Refresh to recover from stale UI state when transition is rejected.
        await loadOrders();
    }
}

async function loadOrders() {
    const container = document.getElementById("orders-list");
    try {
        const res = await fetch(`${API}/api/orders`);
        const data = await res.json();

        if (data.orders.length === 0) {
            container.innerHTML = `<p class="empty-state">No orders yet. Pick a drink from the menu!</p>`;
            return;
        }

        const statusGroups = {
            pending: [],
            preparing: [],
            ready: [],
            completed: [],
            cancelled: [],
        };

        data.orders.forEach((order) => {
            if (statusGroups[order.status]) {
                statusGroups[order.status].push(order);
            }
        });

        const groupedHtml = [
            renderOrderGroup("Pending", statusGroups.pending),
            renderOrderGroup("Preparing", statusGroups.preparing),
            renderOrderGroup("Ready", statusGroups.ready),
            renderOrderGroup("Completed", statusGroups.completed),
            renderOrderGroup("Cancelled", statusGroups.cancelled),
        ].join("");

        container.innerHTML = groupedHtml;
    } catch (err) {
        container.innerHTML = `<p class="empty-state">Failed to load orders.</p>`;
    }
}

// Load on page ready
document.addEventListener("DOMContentLoaded", () => {
    loadMenu();
    loadOrders();
});
