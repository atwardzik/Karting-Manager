async function loadLoginPage() {
    const container = document.getElementById("contents");

    return fetch("/views/login", {
        method: "GET",
    })
        .then(async (response) => {
            container.innerHTML = await response.text();
        })
        .catch((err) => {
            container.innerHTML = "Internal Server Error";
        });
}

export async function showLoginPage() {
    await loadLoginPage();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.addEventListener("click", login);
}

function login(event) {
    event.preventDefault();

    const username = document.querySelector(".loginUsername");
    const password = document.querySelector(".loginPassword");
    const msg = document.querySelector(".message");
    msg.innerHTML = "";

    let errorFlag = false;
    if (username.value.length === 0) {
        username.className += " inputError";
        msg.innerHTML += "<span>Username should not be empty.</span><br>";
        errorFlag = true;
    } else {
        username.classList.remove("inputError");
    }

    if (password.value.length === 0) {
        password.className += " inputError";
        msg.innerHTML += "<span>Password should not be empty.</span><br>";
        errorFlag = true;
    } else {
        password.classList.remove("inputError");
    }

    if (errorFlag) {
        msg.style.display = "inline";
        return;
    } else {
        msg.style.display = "none";
    }


    fetch("login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            username: username.value,
            password: password.value
        })
    })
        .then(async response => {
            if (response.status === 401 || response.status === 400) {
                msg.textContent = await response.text();
                msg.style.display = "inline";
                return null;
            }

            if (!response.ok) {
                throw new Error("Unexpected error");
            }

            return await response.json();
        })
        .then(user => {
            if (!user) return;
            globalThis.location.replace(
                `index?view=user`
            );
        })
        .catch(err => {
            console.error(err);
            msg.innerHTML = "<span>Something went wrong. Please try again.</span>";
            msg.style.display = "inline";
        });
}
