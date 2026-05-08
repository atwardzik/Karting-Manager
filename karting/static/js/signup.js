async function loadSignupPage() {
    const container = document.getElementById("contents");

    return fetch("/views/signup", {
        method: "GET",
    })
        .then(async (response) => {
            container.innerHTML = await response.text();
        })
        .catch((err) => {
            container.innerHTML = "Internal Server Error";
        });
}

export async function showSignupPage() {
    await loadSignupPage();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.addEventListener("click", signup);
}

function preValidate() {
    const name = document.querySelector(".loginName");
    const surname = document.querySelector(".loginSurname");
    const email = document.querySelector(".loginEmail");
    const password = document.querySelector(".loginPassword");
    const msg = document.querySelector(".message");
    msg.innerHTML = "";

    let errorFlag = false;
    if (name.value.length === 0) {
        name.className += " inputError";
        msg.innerHTML += "<span>Name should not be empty.</span><br>";
        errorFlag = true;
    } else {
        name.classList.remove("inputError");
    }

    if (surname.value.length === 0) {
        surname.className += " inputError";
        msg.innerHTML += "<span>Surname should not be empty.</span><br>";
        errorFlag = true;
    } else {
        surname.classList.remove("inputError");
    }

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

function signup(event) {
    event.preventDefault();

    if (!preValidate()) {
        return;
    }
}
