window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    const id = params.get("id");
    const username = params.get("username");

    if (view === "userProfile" && id) {
        //
    } else if (view === "userManagement") {
        //
    } else if (view === "gearManagement") {
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
