async function loadLoginPage() {
    const container = document.getElementById("contents");

    fetch("/views/login", {
        method: "GET",
    })
        .then(async (response) => {
            container.innerHTML = await response.text();
        })
        .catch((err) => {
            container.innerHTML = "Internal Server Error";
        });
}

export function showLoginPage() {
    loadLoginPage();
}
