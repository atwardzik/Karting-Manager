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

const eventBus = new EventTarget();

function highlightGokartParts(gokartId) {
    eventBus.dispatchEvent(
        new CustomEvent("gokart-highlight", {
            detail: { gokartId },
        }),
    );
}

function highlightComponents(gokartId, componentId) {
    eventBus.dispatchEvent(
        new CustomEvent("component-highlight", {
            detail: { gokartId, componentId },
        }),
    );
}

function highlightFault(gokartId, faultId, componentId) {
    eventBus.dispatchEvent(
        new CustomEvent("fault-highlight", {
            detail: { gokartId, faultId, componentId },
        }),
    );
}

function highlightService(gokartId, serviceId, componentId) {
    eventBus.dispatchEvent(
        new CustomEvent("service-highlight", {
            detail: { gokartId, serviceId, componentId },
        }),
    );
}

async function fetchGokarts() {
    try {
        const response = await fetch("/api/gokarts");
        const data = await response.json();

        const list = document.getElementById("gokartsList");
        list.innerHTML = "";

        data.forEach((gokart) => {
            const gokartItem = document.createElement("div");
            gokartItem.className = "gokart-item";
            gokartItem.innerHTML = `
                <strong>ID: ${gokart.gokart_id}</strong> | ${gokart.name}
                <span style="color: ${gokart.status === 1 ? "green" : "red"}; float: right;">
                    Status: ${gokart.status}
                </span>
            `;

            gokartItem.addEventListener("click", () => {
                highlightGokartParts(gokart.gokart_id);
            });
            eventBus.addEventListener("gokart-highlight", (event) => {
                if (gokart.gokart_id === event.detail.gokartId) {
                    gokartItem.classList.add("highlight");
                } else {
                    gokartItem.classList.remove("highlight");
                }
            });
            eventBus.addEventListener("component-highlight", (event) => {
                if (gokart.gokart_id === event.detail.gokartId) {
                    gokartItem.classList.add("highlight");
                } else {
                    gokartItem.classList.remove("highlight");
                }
            });
            eventBus.addEventListener("fault-highlight", (event) => {
                if (gokart.gokart_id === event.detail.gokartId) {
                    gokartItem.classList.add("highlight");
                } else {
                    gokartItem.classList.remove("highlight");
                }
            });
            eventBus.addEventListener("service-highlight", (event) => {
                if (gokart.gokart_id === event.detail.gokartId) {
                    gokartItem.classList.add("highlight");
                } else {
                    gokartItem.classList.remove("highlight");
                }
            });

            list.appendChild(gokartItem);
        });
    } catch (err) {
        console.error("Error fetching gokarts:", err);
    }
}

async function fetchComponents() {
    try {
        const response = await fetch("/api/components");
        const data = await response.json();

        const list = document.getElementById("componentsList");
        list.innerHTML = "";

        data.forEach((component) => {
            const componentItem = document.createElement("div");
            componentItem.className = "component-item";
            componentItem.innerHTML = `
                <strong>ID: ${component.component_id}</strong> | Type: ${component.type}
                <br>
                <small>
                    Engine Hours: ${component.engine_hours} | Mileage: ${component.mileage} | Go-kart: ${component.gokart_id || "Warehouse"}
                </small>
            `;

            componentItem.addEventListener("click", () => {
                highlightComponents(
                    component.gokart_id,
                    component.component_id,
                );
            });
            eventBus.addEventListener("gokart-highlight", (event) => {
                if (component.gokart_id === event.detail.gokartId) {
                    componentItem.classList.add("highlight");
                } else {
                    componentItem.classList.remove("highlight");
                }
            });
            eventBus.addEventListener("component-highlight", (event) => {
                if (component.component_id === event.detail.componentId) {
                    componentItem.classList.add("highlight");
                } else {
                    componentItem.classList.remove("highlight");
                }
            });
            eventBus.addEventListener("fault-highlight", (event) => {
                if (component.component_id === event.detail.componentId) {
                    componentItem.classList.add("highlight");
                } else {
                    componentItem.classList.remove("highlight");
                }
            });
            eventBus.addEventListener("service-highlight", (event) => {
                if (component.component_id === event.detail.componentId) {
                    componentItem.classList.add("highlight");
                } else {
                    componentItem.classList.remove("highlight");
                }
            });

            list.appendChild(componentItem);
        });
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
        list.innerHTML = "";

        data.forEach((fault) => {
            const faultItem = document.createElement("div");
            faultItem.className = "fault-item";
            faultItem.innerHTML = `
                <strong>Fault ID: ${fault.fault_id}</strong> | Component ID: ${fault.component_id}
                <br><small>Status: ${fault.status === 1 ? "Open" : fault.status === 2 ? "In Service" : "Resolved"}</small>
                <br><small>Description: ${fault.description}</small>
            `;

            faultItem.addEventListener("click", () => {
                highlightFault(
                    fault.gokart_id,
                    fault.fault_id,
                    fault.component_id,
                );
            });
            eventBus.addEventListener("gokart-highlight", (event) => {
                faultItem.classList.remove("highlight");
            });
            eventBus.addEventListener("component-highlight", (event) => {
                if (fault.component_id === event.detail.componentId) {
                    faultItem.classList.add("highlight");
                } else {
                    faultItem.classList.remove("highlight");
                }
            });
            eventBus.addEventListener("fault-highlight", (event) => {
                if (fault.fault_id === event.detail.faultId) {
                    faultItem.classList.add("highlight");
                } else {
                    faultItem.classList.remove("highlight");
                }
            });
            eventBus.addEventListener("service-highlight", (event) => {
                if (fault.component_id === event.detail.componentId) {
                    faultItem.classList.add("highlight");
                } else {
                    faultItem.classList.remove("highlight");
                }
            });

            list.appendChild(faultItem);
        });
    } catch (err) {
        console.error("Error fetching faults:", err);
    }
}

async function fetchServices() {
    try {
        const response = await fetch("/api/get-services");
        const data = await response.json();
        const list = document.getElementById("servicesList");
        list.innerHTML = "";

        data.forEach((service) => {
            const serviceItem = document.createElement("div");
            serviceItem.className = "fault-item";
            serviceItem.innerHTML = `
                <strong>Service ID: ${service.service_id}</strong> | Component ID: ${service.component_id}
                <br><small>Type: ${service.type === 1 ? "Repair" : "Replacement"} | Date: ${service.service_date}</small>
                <br><small>Description: ${service.description}</small>
            `;

            serviceItem.addEventListener("click", () => {
                highlightService(
                    service.gokart_id,
                    service.service_id,
                    service.component_id,
                );
            });
            eventBus.addEventListener("gokart-highlight", (event) => {
                serviceItem.classList.remove("highlight");
            });
            eventBus.addEventListener("component-highlight", (event) => {
                if (service.component_id === event.detail.componentId) {
                    serviceItem.classList.add("highlight");
                } else {
                    serviceItem.classList.remove("highlight");
                }
            });
            eventBus.addEventListener("fault-highlight", (event) => {
                if (service.component_id === event.detail.componentId) {
                    serviceItem.classList.add("highlight");
                } else {
                    serviceItem.classList.remove("highlight");
                }
            });
            eventBus.addEventListener("service-highlight", (event) => {
                if (service.service_id === event.detail.serviceId) {
                    serviceItem.classList.add("highlight");
                } else {
                    serviceItem.classList.remove("highlight");
                }
            });

            list.appendChild(serviceItem);
        });
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
