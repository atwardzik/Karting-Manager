import { navigate } from "./router.js";

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

    const signupBtn = document.getElementById("signupBtn");
    signupBtn.addEventListener("click", () => {
        navigate("signup")
    });
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

    return !errorFlag;
}

function handleLoginError(code) {
    const email = document.querySelector(".loginEmail");
    const password = document.querySelector(".loginPassword");
    const msg = document.querySelector(".message");
    msg.innerHTML = "";

    switch (code) {
        case "incorrect_email":
            email.className += " inputError";
            msg.innerHTML += "<span>No account found with this email.</span>";
            break;
        case "incorrect_password":
            password.className += " inputError";
            msg.innerHTML += "<span>Wrong password.</span>";
            break;
        default:
            msg.innerHTML += "<span>Unexpected error occured.</span>";
    }

    msg.style.display = "inline";
}

function login(event) {
    event.preventDefault();

    if (!preValidate()) {
        return;
    }

    const email = document.querySelector(".loginEmail");
    const password = document.querySelector(".loginPassword");
    const msg = document.querySelector(".message");

    fetch("/login", {
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
            const data = await response.json();

            if (!response.ok) {
                handleLoginError(data.error);
                return null;
            }

            return data;
        })
        .then((user) => {
            if (!user) return;
            navigate("user");
        })
        .catch((err) => {
            console.error(err);
            msg.innerHTML =
                "<span>Something went wrong. Please try again.</span>";
            msg.style.display = "inline";
        });
}
