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

    await Promise.all([
        fetchGokarts(),
        fetchComponents(),
        fetchFaults(),
        fetchServices(),
    ]);

    document
        .getElementById("addGokartForm")
        .addEventListener("submit", addGokart);

    document
        .getElementById("addComponentForm")
        .addEventListener("submit", addComponent);

    document
        .getElementById("reportFaultForm")
        .addEventListener("submit", reportFault);

    document
        .getElementById("addServiceForm")
        .addEventListener("submit", addService);
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

async function fetchFaults() {
    try {
        const response = await fetch("/api/get-faults");
        const data = await response.json();
        const list = document.getElementById("faultsList");

        list.innerHTML = data
            .map(
                (fault) => `
            <div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; background: #fff;">
                <strong>Fault ID: ${fault.usterka_id}</strong> | Component ID: ${fault.podzespol_id}
                <br><small>Status: ${fault.status === 1 ? "Open" : fault.status === 2 ? "In Service" : "Resolved"}</small>
                <br><small>Description: ${fault.opis}</small>
            </div>
        `,
            )
            .join("");
    } catch (err) {
        console.error("Error fetching faults:", err);
    }
}

async function fetchServices() {
    try {
        const response = await fetch("/api/get-services");
        const data = await response.json();
        const list = document.getElementById("servicesList");

        list.innerHTML = data
            .map(
                (service) => `
            <div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; background: #fff;">
                <strong>Service ID: ${service.serwis_id}</strong> | Component ID: ${service.podzespol_id}
                <br><small>Type: ${service.typ === 1 ? "Repair" : "Replacement"} | Date: ${service.data_serwisu}</small>
                <br><small>Description: ${service.opis}</small>
            </div>
        `,
            )
            .join("");
    } catch (err) {
        console.error("Error fetching services:", err);
    }
}

async function reportFault(event) {
    event.preventDefault();

    const payload = {
        component_id: document.getElementById("faultComponentId").value,
        description: document.getElementById("faultDescription").value,
    };

    try {
        const response = await fetch("/api/report-fault", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.status === 400 && result.error === "missing_description") {
            alert("Description is mandatory!");
        } else if (response.status === 403 && result.error === "unauthorized") {
            alert("Only mechanics and drivers can report faults!");
        } else if (response.ok) {
            document.getElementById("reportFaultForm").reset();
            await fetchFaults();
        } else {
            console.error(result.error);
        }
    } catch (err) {
        console.error("Error reporting fault:", err);
    }
}

async function addService(event) {
    event.preventDefault();

    const payload = {
        fault_id: document.getElementById("serviceFaultId").value,
        type: document.getElementById("serviceType").value,
        description: document.getElementById("serviceDescription").value,
    };

    try {
        const response = await fetch("/api/add-service", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.status === 404 && result.error === "fault_not_found") {
            alert("The specified Fault ID does not exist!");
        } else if (response.status === 403 && result.error === "unauthorized") {
            alert("Only mechanics can perform services!");
        } else if (response.ok) {
            document.getElementById("addServiceForm").reset();
            await fetchServices();
            await fetchFaults();
            await fetchComponents();
        } else {
            console.error(result.error);
        }
    } catch (err) {
        console.error("Error logging service:", err);
    }
}
