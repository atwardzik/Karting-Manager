import { decodeComponent } from "./gearManagement.js";

let cachedFaultsReport = [];
let cachedUsageReport = [];

async function loadReportsPage() {
    const container = document.getElementById("contents");

    try {
        const response = await fetch("/views/reportsManagement", {
            method: "GET",
        });
        container.innerHTML = await response.text();
    } catch (err) {
        container.innerHTML = "Internal Server Error";
        console.error("Error loading reports page:", err);
    }
}

export async function showReportsPage() {
    await loadReportsPage();

    const faultsSearch = document.getElementById("faultsReportSearch");
    if (faultsSearch) {
        faultsSearch.addEventListener("input", renderComponentsFaultsReport);
    }

    const usageSearch = document.getElementById("usageReportSearch");
    if (usageSearch) {
        usageSearch.addEventListener("input", renderGokartUsageReport);
    }

    // Pobranie danych z API
    await Promise.all([
        fetchComponentsFaultsReport(),
        fetchGokartUsageReport(),
    ]);
}

async function fetchComponentsFaultsReport() {
    try {
        const response = await fetch("/api/reports/components-faults");
        cachedFaultsReport = await response.json();
        renderComponentsFaultsReport();
    } catch (err) {
        console.error("Error fetching components faults report:", err);
    }
}

function renderComponentsFaultsReport() {
    const list = document.getElementById("faultsReportList");
    if (!list) return;

    const filterText =
        document.getElementById("faultsReportSearch")?.value.toLowerCase() ||
        "";

    const filteredData = cachedFaultsReport.filter((row) => {
        const componentName = decodeComponent(row.component_type).toLowerCase();
        const gokartName = (row.gokart_name || "Warehouse").toLowerCase();
        const componentId = row.component_id.toString();

        return (
            componentName.includes(filterText) ||
            gokartName.includes(filterText) ||
            componentId.includes(filterText)
        );
    });

    list.innerHTML = filteredData
        .map(
            (row) => `
        <div style="border: 1px solid #ccc; padding: 12px; border-radius: 5px; background: #fff; line-height: 1.4;">
            <strong>Component ID: ${row.component_id}</strong> | Type: ${decodeComponent(row.component_type)}
            <br>
            <small style="color: #555;">
                Assigned to: <strong>${row.gokart_name || "Warehouse"}</strong> 
                ${row.gokart_id ? `(ID: ${row.gokart_id})` : ""}
            </small>
            <br>
            <small style="color: #777;">
                Engine Hours: ${row.engine_hours}h | Mileage: ${row.mileage} km
            </small>
            <span style="float: right; background: #ffdede; color: #d93838; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 12px; margin-top: -20px;">
                Faults: ${row.total_faults}
            </span>
        </div>
    `,
        )
        .join("");
}

async function fetchGokartUsageReport() {
    try {
        const response = await fetch("/api/reports/gokart-usage");
        cachedUsageReport = await response.json();

        const list = document.getElementById("usageReportList");
        if (cachedUsageReport.error) {
            list.innerHTML = `<div style="color: red; border: 1px solid red; padding: 10px; background: #fff1f1;">${cachedUsageReport.error}</div>`;
            return;
        }

        renderGokartUsageReport();
    } catch (err) {
        console.error("Error fetching gokart usage report:", err);
    }
}

function renderGokartUsageReport() {
    const list = document.getElementById("usageReportList");
    if (!list) return;

    const filterText =
        document.getElementById("usageReportSearch")?.value.toLowerCase() || "";

    const filteredData = cachedUsageReport.filter((row) => {
        return (
            row.event_name.toLowerCase().includes(filterText) ||
            row.race_name.toLowerCase().includes(filterText) ||
            row.gokart_name.toLowerCase().includes(filterText) ||
            row.driver_name.toLowerCase().includes(filterText) ||
            row.driver_email.toLowerCase().includes(filterText)
        );
    });

    list.innerHTML = filteredData
        .map(
            (row) => `
        <div style="border: 1px solid #ccc; padding: 12px; border-radius: 5px; background: #fff; line-height: 1.4;">
            <strong style="color: #2c3e50;">${row.event_name}</strong> 
            <span style="float: right; color: #777; font-size: 12px;">${new Date(row.event_date).toLocaleDateString()}</span>
            <br>
            <small style="color: #27ae60; font-weight: bold;">Race: ${row.race_name}</small>
            <br>
            <small>Go-kart: <strong>${row.gokart_name}</strong> (ID: ${row.gokart_id})</small>
            <br>
            <small style="color: #444;">Driver: <strong>${row.driver_name}</strong> (${row.driver_email})</small>
            <br>
            <small style="color: #777;">Result: Start Pos: ${row.starting_position} | Finish Pos: ${row.finishing_position}</small>
        </div>
    `,
        )
        .join("");
}
