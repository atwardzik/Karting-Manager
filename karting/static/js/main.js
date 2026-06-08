import { showLoginPage } from "./login.js";
import { showSignupPage } from "./signup.js";
import { navigate } from "./router.js";
import { showGearManagementPage } from "./gearManagement.js";
import { showEventsManagementPage } from "./eventsManagement.js";
import { showEventDetailsPage } from "./eventDetails.js";
import { showNotificationsManagementPage } from "./notificationsManagement.js";
import { createEventTile } from "./eventsManagement.js";

window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    const id = params.get("id");
    const username = params.get("username");

    if (view === "user") {
        showHelloUser();
    } else if (view === "login") {
        showLoginPage();
    } else if (view === "signup") {
        showSignupPage();
    } else if (view === "userManagement") {
        //
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

function showHelloUser() {
    const container = document.getElementById("contents");
    fetch("/helloUser")
        .then((response) => response.json())
        .then((record) => {
            container.innerHTML = "";

            container.innerHTML = `<p>Hello ${record.name} ${record.surname}!</p>`;
        })
        .catch((error) => {
            console.error("Error:", error);
            container.innerHTML = `
                <p>You are not logged in!</p>
                <button type="button" id="loginBtn" class="modifier" style="margin: auto;">Log in</button>
            `;

            const submitBtn = document.getElementById("loginBtn");
            submitBtn.addEventListener("click", () => {
                navigate("login");
            });
        });
}
