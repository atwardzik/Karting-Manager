import { navigate } from "./router.js";

async function loadEventDetailsPage() {
    const container = document.getElementById("contents");

    return fetch("/views/eventDetails", {
        method: "GET",
    })
        .then(async (response) => {
            container.innerHTML = await response.text();
        })
        .catch(() => {
            container.innerHTML = "Internal Server Error";
        });
}

export async function showEventDetailsPage(id) {
    await loadEventDetailsPage();

    await fetchEventDetails(id);
}

async function fetchEventDetails(eventId) {
    const container = document.getElementById("eventDetails");

    try {
        const res = await fetch(`/api/subevents?id=${eventId}`);
        const subevents = await res.json();

        container.innerHTML = "";

        renderSubevents(subevents);
    } catch (err) {
        container.innerHTML = "Internal Server Error";
    }
}

function renderSubevents(subevents) {
    const container = document.getElementById("eventDetails");

    subevents.forEach((race) => {
        const details = document.createElement("details");
        details.style = `
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 10px;
            background: #fafafa;
        `;

        const summary = document.createElement("summary");
        summary.style.cursor = "pointer";
        summary.style.fontWeight = "bold";

        summary.textContent = `${race.name || "N/A"}`;

        const body = document.createElement("div");
        body.style.marginTop = "10px";
        body.innerHTML = "Loading laps...";

        details.appendChild(summary);
        details.appendChild(body);

        details.addEventListener("toggle", async () => {
            if (details.open && !details.dataset.loaded) {
                const laps = await fetchLaps(race.event_id);
                body.innerHTML = renderLaps(laps);
                details.dataset.loaded = "true";
            }
        });

        container.appendChild(details);
    });
}

async function fetchLaps(raceId) {
    const res = await fetch(`/api/laps?race_id=${raceId}`);
    return await res.json();
}

function renderLaps(participations) {
    if (!participations || participations.length === 0) {
        return "<div>No laps recorded</div>";
    }
    return `
    <table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:14px;">
        <thead>
            <tr style="background:#f0f0f0;">
                <th style="padding:8px 12px; text-align:left; border:1px solid #ddd;">Competitor</th>
                <th style="padding:8px 12px; text-align:center; border:1px solid #ddd;">Start</th>
                <th style="padding:8px 12px; text-align:center; border:1px solid #ddd;">Finish</th>
                ${participations
                    .flatMap((p) => p.laps.map((l) => l.lap_number))
                    .filter((n, i, arr) => arr.indexOf(n) === i)
                    .sort((a, b) => a - b)
                    .map(
                        (n) =>
                            `<th style="padding:8px 12px; text-align:right; border:1px solid #ddd;">Lap ${n}</th>`,
                    )
                    .join("")}
            </tr>
        </thead>
        <tbody>
            ${participations
                .map((p, i) => {
                    const lapMap = Object.fromEntries(
                        p.laps.map((l) => [l.lap_number, l.time]),
                    );
                    const allLapNumbers = participations
                        .flatMap((p) => p.laps.map((l) => l.lap_number))
                        .filter((n, i, arr) => arr.indexOf(n) === i)
                        .sort((a, b) => a - b);
                    return `
                    <tr style="background:${i % 2 === 0 ? "#fff" : "#f9f9f9"}">
                        <td style="padding:8px 12px; border:1px solid #ddd; font-weight:bold;">#${p.competitor_id + " " + p.first_name + " " + p.last_name}</td>
                        <td style="padding:8px 12px; text-align:center; border:1px solid #ddd;">${p.starting_position}</td>
                        <td style="padding:8px 12px; text-align:center; border:1px solid #ddd;">${p.finishing_position ?? "N/A"}</td>
                        ${allLapNumbers
                            .map(
                                (n) => `
                            <td style="padding:8px 12px; text-align:right; border:1px solid #ddd;">
                                ${lapMap[n] !== undefined ? parseFloat(lapMap[n]).toFixed(2) : "<span style='color:#ccc'>—</span>"}
                            </td>
                        `,
                            )
                            .join("")}
                    </tr>
                `;
                })
                .join("")}
        </tbody>
    </table>
`;
}
