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
        const response = await fetch("/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (response.status === 403) {
            alert("Error: Unauthorized. Please log in to add events.");
            return;
        }

        if (!response.ok) {
            alert("Error: Failed to add event.");
            return;
        }

        document.getElementById("addEventForm").reset();
        await fetchEvents();
    } catch (err) {
        console.error("Error adding event:", err);
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
                    Event ID: ${race.event_id} | Weather: ${race.weather_conditions}
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

    const payload = {
        event_id: parseInt(document.getElementById("raceEventId").value),
        name: document.getElementById("raceName").value,
        weather_conditions: parseInt(
            document.getElementById("raceWeatherConditions").value,
        ),
    };

    try {
        const response = await fetch("/api/add-race", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (response.status === 403) {
            alert("Error: Unauthorized!");
            return;
        }

        if (response.status === 404) {
            alert("Error: Event not found!");
            return;
        }

        if (!response.ok) {
            alert("Error: Failed to add race.");
            return;
        }

        document.getElementById("addRaceForm").reset();
        await fetchRaces();
    } catch (err) {
        console.error("Error adding race:", err);
    }
}
