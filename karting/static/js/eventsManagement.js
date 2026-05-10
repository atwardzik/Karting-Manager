async function loadEventsManagementPage() {
    const container = document.getElementById("contents");

    return fetch("/views/eventsManagement", {
        method: "GET",
    })
        .then(async (response) => {
            container.innerHTML = await response.text();
        })
        .catch((err) => {
            container.innerHTML = "Internal Server Error";
        });
}

export async function showEventsManagementPage() {
    await loadEventsManagementPage();

    await Promise.all([fetchEvents()]);

    document
        .getElementById("addEventForm")
        .addEventListener("submit", addEvent);
}

async function fetchEvents() {
    try {
        const response = await fetch("/api/events");
        const data = await response.json();

        const list = document.getElementById("eventsList");

        list.innerHTML = data
            .map(
                (event) => `
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <strong>ID: ${event.event_id}</strong> | ${event.name}
                <br>
                <small style="color: #666;">
                    <i class="fa-solid fa-calendar"></i> Date: ${event.date}
                    | <i class="fa-solid fa-flag"></i> Type: ${event.type}
                    | <i class="fa-solid fa-location-dot"></i> Track ID: ${event.track_id}
                </small>
            </div>
        `,
            )
            .join("");
    } catch (err) {
        console.error("Error fetching events:", err);
    }
}

async function addEvent(event) {
    event.preventDefault();

    const payload = {
        name: document.getElementById("eventName").value,
        date: document.getElementById("eventDate").value,
        type: document.getElementById("eventType").value,
        track_id: document.getElementById("eventTrackId").value,
    };

    try {
        await fetch("/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        document.getElementById("addEventForm").reset();

        await fetchEvents();
    } catch (err) {
        console.error("Error adding event:", err);
    }
}
