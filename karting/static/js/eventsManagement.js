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

    await Promise.all([fetchEvents(), fetchRaces()]);

    document
        .getElementById("addEventForm")
        .addEventListener("submit", addEvent);

    document.getElementById("addRaceForm").addEventListener("submit", addRace);
}

export function createEventTile(event) {
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
            id: event.event_id,
        });
    });

    return tile;
}

async function fetchEvents() {
    try {
        const response = await fetch("/api/events");
        const data = await response.json();

        const list = document.getElementById("eventsList");
        if (list) {
            list.innerHTML = "";
            data.forEach((event) => list.appendChild(createEventTile(event)));
        }

        const selectDropdown = document.getElementById("raceEventId");
        if (selectDropdown) {
            selectDropdown.innerHTML =
                '<option value="">Select Event</option>' +
                data
                    .map(
                        (event) => `
                <option value="${event.event_id}">${event.name} (ID: ${event.event_id})</option>
            `,
                    )
                    .join("");
        }
    } catch (err) {
        console.error("Error fetching events:", err);
    }
}

async function addEvent(event) {
    event.preventDefault();

    const msg = document.getElementById("eventFormMessage");
    if (msg) {
        msg.style.display = "none";
        msg.innerHTML = "";
    }

    const payload = {
        name: document.getElementById("eventName").value,
        date: document.getElementById("eventDate").value,
        type: document.getElementById("eventType").value,
        track_id: document.getElementById("eventTrackId").value,
    };

    try {
        const response = await fetch("/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorText = "Failed to add event.";
            if (response.status === 403) {
                errorText = "Unauthorized. Only admins can add events";
            }

            if (msg) {
                msg.innerHTML = `<span>${errorText}</span>`;
                msg.style.display = "inline";
            }
            return;
        }

        document.getElementById("addEventForm").reset();
        await fetchEvents();
    } catch (err) {
        console.error("Error adding event:", err);
        if (msg) {
            msg.innerHTML =
                "<span>Something went wrong. Please try again.</span>";
            msg.style.display = "inline";
        }
    }
}

async function fetchRaces() {
    try {
        const response = await fetch("/api/get-races");
        const resData = await response.json();
        const racesList = document.getElementById("racesList");

        if (!racesList) return;

        racesList.innerHTML = resData.data
            .map(
                (race) => `
            <div style="border: 1px solid #ddd; padding: 10px; margin-top: 10px; border-radius: 6px; background: #fafafa;">
                <strong>Race ID: ${race.race_id}</strong> | Name: ${race.name}
                <br>
                <small style="color: #666;">
                    Event ID: ${race.event_id} | Weather: ${race.weather_conditions !== null ? race.weather_conditions : "N/A"}
                </small>
            </div>
        `,
            )
            .join("");
    } catch (err) {
        console.error("Error fetching races:", err);
    }
}

async function addRace(event) {
    event.preventDefault();

    const msg = document.getElementById("raceFormMessage");
    if (msg) {
        msg.style.display = "none";
        msg.innerHTML = "";
    }
    const weatherInput = document.getElementById("raceWeatherConditions").value;
    const payload = {
        event_id: parseInt(document.getElementById("raceEventId").value),
        name: document.getElementById("raceName").value,
        weather_conditions:
            weatherInput.trim() !== "" ? parseInt(weatherInput) : null,
    };

    try {
        const response = await fetch("/api/add-race", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const resData = await response.json();

        if (!response.ok) {
            let errorText = "An unexpected error occurred.";
            if (response.status === 403) {
                errorText = "Unauthorized. Only admins can add races.";
            } else if (response.status === 404) {
                errorText = "Event not found.";
            } else if (resData.error === "race_already_exists") {
                errorText =
                    "A race with this exavt name already exists in this event";
            } else if (resData.error === "missing_fields") {
                errorText = "Please fill in all required fields.";
            } else if (resData.error) {
                errorText = resData.error;
            }

            if (msg) {
                msg.innerHTML = `<span>${errorText}</span>`;
                msg.style.display = "inline";
            }
            return;
        }

        document.getElementById("addRaceForm").reset();
        await fetchRaces();
    } catch (err) {
        console.error("Error adding race:", err);
        if (msg) {
            msg.innerHTML =
                "<span>Something went wrong. Please try again.</span>";
            msg.style.display = "inline";
        }
    }
}
