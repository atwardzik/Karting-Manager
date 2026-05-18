import { navigate } from "./router.js";

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

function createEventTile(event) {
    const tile = document.createElement("div");
    tile.className = "eventTile";
    tile.innerHTML = `
        <strong>ID: ${event.event_id}</strong> | ${event.name}
        <br />
        <small style="color: #666;">
            <i class="fa-solid fa-calendar"></i> Date: ${event.date} |
            <i class="fa-solid fa-flag"></i> Type: ${event.type} |
            <i class="fa-solid fa-location-dot"></i> Track ID: ${event.track_id}
        </small>
    `;
    tile.addEventListener("click", () => {
        navigate("eventDetails", {
            id: event.event_id
        });
    });

    return tile;
}

async function fetchEvents() {
    try {
        const response = await fetch("/api/events");
        const data = await response.json();

        const list = document.getElementById("eventsList");

        list.innerHTML = "";

        data.forEach((event) => {
            list.appendChild(createEventTile(event));
        });
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
