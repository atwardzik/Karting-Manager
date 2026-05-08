async function loadGearManagementPage() {
    const container = document.getElementById("contents");

    return fetch("/views/gearManagement", {
        method: "GET",
    })
        .then(async (response) => {
            container.innerHTML = await response.text();
        })
        .catch((err) => {
            container.innerHTML = "Internal Server Error";
        });
}

export async function showGearManagementPage() {
    await loadGearManagementPage();

    await Promise.all([fetchGokarts(), fetchComponents()]);

    document
        .getElementById("addGokartForm")
        .addEventListener("submit", addGokart);

    document
        .getElementById("addComponentForm")
        .addEventListener("submit", addComponent);
}

async function fetchGokarts() {
    try {
        const response = await fetch("/api/gokarts");
        const data = await response.json();

        const list = document.getElementById("gokartsList");

        list.innerHTML = data
            .map(
                (gokart) => `
            <div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; background: #fff;">
                <strong>ID: ${gokart.gokart_id}</strong>
                | ${gokart.name}

                <span
                    style="
                        color: ${gokart.status === 1 ? "green" : "red"};
                        float: right;
                    "
                >
                    Status: ${gokart.status}
                </span>
            </div>
        `,
            )
            .join("");
    } catch (err) {
        console.error("Error fetching gokarts:", err);
    }
}

async function fetchComponents() {
    try {
        const response = await fetch("/api/components");
        const data = await response.json();

        const list = document.getElementById("componentsList");

        list.innerHTML = data
            .map(
                (component) => `
            <div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; background: #fff;">
                <strong>ID: ${component.component_id}</strong>
                | Type: ${component.type}

                <br>

                <small>
                    Engine Hours: ${component.engine_hours}
                    | Mileage: ${component.mileage}
                    | Go-kart: ${component.gokart_id || "Warehouse"}
                </small>
            </div>
        `,
            )
            .join("");
    } catch (err) {
        console.error("Error fetching components:", err);
    }
}

async function addGokart(event) {
    event.preventDefault();

    const name = document.getElementById("gokartName").value;

    try {
        await fetch("/api/gokarts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                status: 1,
            }),
        });

        document.getElementById("addGokartForm").reset();

        await fetchGokarts();
    } catch (err) {
        console.error("Error adding gokart:", err);
    }
}

async function addComponent(event) {
    event.preventDefault();

    const payload = {
        type: document.getElementById("componentType").value,
        engine_hours: document.getElementById("componentMth").value,
        mileage: document.getElementById("componentMileage").value,
        installation_date: document.getElementById("componentDate").value,
        gokart_id: document.getElementById("componentGokartId").value || null,
        status: 1,
    };

    try {
        await fetch("/api/components", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        document.getElementById("addComponentForm").reset();

        await fetchComponents();
    } catch (err) {
        console.error("Error adding component:", err);
    }
}
