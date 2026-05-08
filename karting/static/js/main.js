import { showLoginPage } from "./login.js";

window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    // const id = params.get("id");
    const username = params.get("username");

    if (view === "user") {
        showHelloUser();
    } else if (view === "login") {
        showLoginPage();
    } else if (view === "userManagement") {
        //
    } else if (view === "gearManagement") {         //gearManagement czy gear? sprawdzić
        //
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
                        <div class="karting-list-title">${row.nazwa} ${row.data}</div>
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
            container.innerHTML = `<p>You are not logged in!</p>`;
        });
}

function showGearManagement() {                                                 // Added: "showGearManagement() fetchGokarty() fetchPodzespoly() addGokart(event) addPodzespol(event)"
    const container = document.getElementById("contents");
    container.innerHTML = `
        <h2 style="margin-top: 0;">Zarządzanie Sprzętem</h2>
        <div style="display: flex; gap: 50px; flex-wrap: wrap;">
            
            <div style="flex: 1; min-width: 300px;">
                <h3>Dodaj Gokarta</h3>
                <form id="addGokartForm" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px;">
                    <input type="text" id="gokartNazwa" placeholder="Nazwa gokarta (np. Kart #3)" required>
                    <button type="submit" class="modifier" style="margin-left: 0;">Dodaj Gokart</button>
                </form>
                
                <h3>Lista Gokartów</h3>
                <div id="gokartyList" style="display: flex; flex-direction: column; gap: 10px;">Ładowanie...</div>
            </div>

            <div style="flex: 1; min-width: 300px;">
                <h3>Dodaj Podzespół</h3>
                <form id="addPodzespolForm" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px;">
                    <input type="number" id="podTyp" placeholder="Typ (np. 1 - Silnik, 2 - Opony)" required>
                    <input type="number" id="podMth" placeholder="Motogodziny początkowe" value="0">
                    <input type="number" id="podPrzebieg" placeholder="Przebieg (km)" value="0">
                    <label style="font-size: 14px; margin-bottom: -5px;">Data montażu:</label>
                    <input type="date" id="podData" required>
                    <input type="number" id="podGokartId" placeholder="ID Gokarta (zostaw puste by dodać na magazyn)">
                    <button type="submit" class="modifier" style="margin-left: 0;">Dodaj Podzespół</button>
                </form>

                <h3>Lista Podzespołów</h3>
                <div id="podzespolyList" style="display: flex; flex-direction: column; gap: 10px;">Ładowanie...</div>
            </div>
        </div>
    `;

    fetchGokarty();
    fetchPodzespoly();
    document.getElementById("addGokartForm").addEventListener("submit", addGokart);
    document.getElementById("addPodzespolForm").addEventListener("submit", addPodzespol);
}

async function fetchGokarty() {
    try {
        const response = await fetch("/api/gokarty");
        const data = await response.json();
        const list = document.getElementById("gokartyList");
        list.innerHTML = data.map(g => `
            <div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; background: #fff;">
                <strong>ID: ${g.gokart_id}</strong> | ${g.nazwa} 
                <span style="color: ${g.status === 1 ? 'green' : 'red'}; float: right;">Status: ${g.status}</span>
            </div>
        `).join("");
    } catch (err) {
        console.error("Error:", err);
    }
}

async function fetchPodzespoly() {
    try {
        const response = await fetch("/api/podzespoly");
        const data = await response.json();
        const list = document.getElementById("podzespolyList");
        list.innerHTML = data.map(p => `
            <div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; background: #fff;">
                <strong>ID: ${p.podzespol_id}</strong> | Typ: ${p.typ} 
                <br> <small>MTH: ${p.motogodziny} | Przebieg: ${p.przebieg} | Gokart: ${p.gokart_id || 'Magazyn'}</small>
            </div>
        `).join("");
    } catch (err) {
        console.error("Error:", err);
    }
}

async function addGokart(event) {
    event.preventDefault();
    const nazwa = document.getElementById("gokartNazwa").value;

    await fetch("/api/gokarty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nazwa: nazwa, status: 1 })
    });

    document.getElementById("addGokartForm").reset();
    fetchGokarty();
}

async function addPodzespol(event) {
    event.preventDefault();
    
    const payload = {
        typ: document.getElementById("podTyp").value,
        motogodziny: document.getElementById("podMth").value,
        przebieg: document.getElementById("podPrzebieg").value,
        data_montazu: document.getElementById("podData").value,
        gokart_id: document.getElementById("podGokartId").value,
        status: 1
    };

    await fetch("/api/podzespoly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    document.getElementById("addPodzespolForm").reset();
    fetchPodzespoly();
}