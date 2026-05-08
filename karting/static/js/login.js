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

function preValidate() {
    const email = document.querySelector(".loginEmail");
    const password = document.querySelector(".loginPassword");
    const msg = document.querySelector(".message");
    msg.innerHTML = "";

    let errorFlag = false;
    if (email.value.length === 0) {
        email.className += " inputError";
        msg.innerHTML += "<span>Username should not be empty.</span><br>";
        errorFlag = true;
    } else {
        email.classList.remove("inputError");
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
}

function handleLoginError(code) {
    const messages = {
        incorrect_username: "No account found with this email.",
        incorrect_password: "Wrong password.",
        account_locked: "Your account has been locked.",
    };

    msg.textContent = messages[code] ?? "An unexpected error occurred.";
}

function login(event) {
    event.preventDefault();

    preValidate();

    fetch("login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            email: email.value,
            password: password.value,
        }),
    })
        .then(async (response) => {
            const data = await r.json();

            if (!r.ok) {
                handleLoginError(data.error);
                return null;
            }

            return data;
        })
        .then((user) => {
            if (!user) return;
            globalThis.location.replace(`index?view=user`);
        })
        .catch((err) => {
            console.error(err);
            msg.innerHTML =
                "<span>Something went wrong. Please try again.</span>";
            msg.style.display = "inline";
        });
}
