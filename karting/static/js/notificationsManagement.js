async function loadNotificationsManagementPage() {
    const container = document.getElementById("contents");

    return fetch("/views/notificationsManagement", {
        method: "GET",
    })
        .then(async (response) => {
            container.innerHTML = await response.text();
        })
        .catch((err) => {
            container.innerHTML = "Internal Server Error";
        });
}

export async function showNotificationsManagementPage() {
    await loadNotificationsManagementPage();

    await fetchNotifications();

    document
        .getElementById("addNotificationForm")
        .addEventListener("submit", addNotification);

    document
        .getElementById("filterNotificationsBtn")
        .addEventListener("click", fetchNotifications);
}

async function fetchNotifications() {
    try {
        const dateFrom = document.getElementById("notificationDateFrom").value;
        const dateTo = document.getElementById("notificationDateTo").value;

        let url = "/api/notifications";
        const params = new URLSearchParams();
        if (dateFrom) params.append("from", dateFrom);
        if (dateTo) params.append("to", dateTo);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        const list = document.getElementById("notificationsList");

        if (data.length === 0) {
            list.innerHTML = `<p style="color: #666; font-style: italic;">No notifications found for this period.</p>`;
            return;
        }

        list.innerHTML = data
            .map(
                (notification) => `
            <div style="border: 2px solid black; padding: 15px; border-radius: 5px; background: #fff; box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1); position: relative;">
                <button 
                    class="delete-notification-btn" 
                    data-id="${notification.notification_id}"
                    style="position: absolute; top: 15px; right: 15px; background: none; border: none; cursor: pointer; font-size: 16px; color: #cc0000;"
                    title="Delete notification"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>
                
                <p style="margin: 0 0 10px 0; color: #333; line-height: 1.4; font-size: 16px; font-weight: 500; padding-right: 30px;">
                    ${notification.content}
                </p>
                <small style="color: #666;">
                    Date: ${notification.created_date} 
                    | Status: ${notification.status}
                    | Target User ID: ${notification.user_id || "All Users"}
                </small>
            </div>
        `,
            )
            .join("");

        document.querySelectorAll(".delete-notification-btn").forEach((btn) => {
            btn.addEventListener("click", deleteNotification);
        });
    } catch (err) {
        console.error("Error fetching notifications:", err);
        document.getElementById("notificationsList").innerHTML =
            "Error loading notifications.";
    }
}

async function addNotification(event) {
    event.preventDefault();

    const payload = {
        title: document.getElementById("notificationTitle").value,
        message: document.getElementById("notificationMessage").value,
        target_user_id:
            document.getElementById("notificationTargetUserId").value || null,
    };

    try {
        await fetch("/api/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        document.getElementById("addNotificationForm").reset();

        await fetchNotifications();
    } catch (err) {
        console.error("Error adding notification:", err);
    }
}

async function deleteNotification(event) {
    const button = event.target.closest(".delete-notification-btn");
    const id = button.getAttribute("data-id");

    if (!confirm("Are you sure you want to delete this notification?")) {
        return;
    }

    try {
        await fetch(`/api/notifications/${id}`, {
            method: "DELETE",
        });

        await fetchNotifications();
    } catch (err) {
        console.error("Error deleting notification:", err);
    }
}
