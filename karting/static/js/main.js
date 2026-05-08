import { showLoginPage } from "./login.js";
import { showSignupPage } from "./signup.js";
import { navigate } from "./router.js";
import { showGearManagementPage } from "./gearManagement.js";

window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    // const id = params.get("id");
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
    } else if (view === "filtering") {
        //
    } else if (view === "user") {
        //
    } else {
        showKartingHistory();
    }
});

function showKartingHistory() {
    fetch("/kartingHistory")
        .then((response) => response.json())
        .then((record) => {
            const container = document.getElementById("contents");
            container.innerHTML = "";

            record.forEach((row) => {
                const card = document.createElement("a");
                card.className = "karting-card";
                card.innerHTML = `
                    <div class="karting-main">
                        <div class="karting-list-title">${row.name} ${row.date}</div>
                    </div>
                `;

                container.appendChild(card);
            });
        })
        .catch((error) => {
            console.error("Error:", error);
        });
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
