window.addEventListener("DOMContentLoaded", () => {
    const select = document.querySelector("#language-select");
    const lang = getCookie('lang');
    if (lang) {
        select.value = lang;
    }

    select.addEventListener("change", () => {
        const lang = select.value;
        fetch("change-language", {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: `lang=${encodeURIComponent(lang)}`
        })
            .then(async response => {
                if (!response.ok) {
                    throw new Error("Unexpected error");
                }

                location.reload();
            })
            .catch(err => {
                console.error("Error message:", err.message);
                alert(`Failed to update issue: ${err.message}`);
            });
    });


    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    const id = params.get("id");
    const username = params.get("username");

    if (view === "issue" && id) {
        // showIssueDetails(id);
    } else if (view === "filter") {
        // showFilter();
    } else if (view === "edit" && id) {
        // showEdit(id);
    } else if (view === "new") {
        // showIssueCreator();
    } else if (view === "user") {
        // showUser(username);
    } else {
        // showList();
    }
});