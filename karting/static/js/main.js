import { showLoginPage } from "./login.js";
import { showSignupPage } from "./signup.js";
import { navigate } from "./router.js";
import { showGearManagementPage } from "./gearManagement.js";
import { showEventsManagementPage } from "./eventsManagement.js";
import { showEventDetailsPage } from "./eventDetails.js";
import { showNotificationsManagementPage } from "./notificationsManagement.js";
import { createEventTile } from "./eventsManagement.js";
import { showReportsPage } from "./reports.js";

window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    const id = params.get("id");
    const username = params.get("username");

    if (view === "user") {
        showUserRaces();
    } else if (view === "login") {
        showLoginPage();
    } else if (view === "signup") {
        showSignupPage();
    } else if (view === "userManagement") {
        //
    } else if (view === "reportsManagement") {
        showReportsPage();
    } else if (view === "gearManagement") {
        showGearManagementPage();
    } else if (view === "eventsManagement") {
        showEventsManagementPage();
    } else if (view === "eventDetails") {
        showEventDetailsPage(id);
    } else if (view === "notificationsManagement") {
        showNotificationsManagementPage();
    } else if (view === "filtering") {
        //
    } else if (view === "user") {
        //
    } else if (view === "history") {
        showKartingHistory();
    } else {
        navigate("history");
    }
});

async function showKartingHistory() {
    const container = document.getElementById("contents");

    await fetch("/kartingHistory", {
        method: "GET",
    })
        .then(async (response) => {
            container.innerHTML = await response.text();
        })
        .catch((err) => {
            container.innerHTML = "Internal Server Error";
        });

    try {
        const response = await fetch("/api/events");
        const data = await response.json();

        const list = document.getElementById("eventsList");
        if (list) {
            list.innerHTML = "";
            data.forEach((event) => list.appendChild(createEventTile(event)));
        }
    } catch (err) {
        console.error("Error fetching events:", err);
    }
}

async function showUserRaces() {
    const container = document.getElementById("contents");
    container.innerHTML = `
        <h2 style="margin-top: 0">Your Races</h2>
        <div id="userRacesList" style="display: flex; flex-direction: column; gap: 10px;">
            Loading races...
        </div>
    `;

    try {
        const response = await fetch("/api/user-races");
        if (!response.ok) throw new Error("Unauthorized or server error");

        const races = await response.json();
        const list = document.getElementById("userRacesList");

        if (races.length === 0) {
            list.innerHTML = "<p>You haven't participated in any races yet.</p>";
            return;
        }

        list.innerHTML = races.map((race) => `
            <div style="border: 1px solid #ccc; padding: 12px; border-radius: 5px; background: #fff;">
                <strong>Event: ${race.event_name}</strong> | Race: ${race.race_name}
                <br>
                <small style="color: #666;">
                    Date: ${race.date} | Starting Pos: ${race.starting_position} | Finishing Pos: ${race.finishing_position}
                </small>
            </div>
        `).join("");
    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `
            <p>You are not logged in!</p>
            <button type="button" id="loginBtn" class="modifier" style="margin: auto;">Log in</button>
        `;
        document.getElementById("loginBtn").addEventListener("click", () => navigate("login"));
    }
}
