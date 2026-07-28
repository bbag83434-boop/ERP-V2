/* =========================================================
   Chef Bisu Login
   Part 3A - Initialization & Animation Base
========================================================= */

"use strict";

/* -----------------------------
   DOM Ready
----------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    checkExistingSession();

    initPasswordToggle();

    createParticles();

    startFloatingCard();

    startLogoPulse();

});


/* -----------------------------
   Session Check
----------------------------- */

async function checkExistingSession() {

    try {

        const response = await fetch("/session", {
            credentials: "include"
        });

        const data = await response.json();

        if (!data.loggedIn) return;

        showLoading();

        setTimeout(() => {

            if (data.user.role === "admin") {

                location.href = "/pages/dashboard.html";

            } else {

                location.href = "/pages/user-dashboard.html";

            }

        }, 800);

    } catch (err) {

        console.error("Session Check:", err);

    }

}


/* -----------------------------
   Password Toggle
----------------------------- */

function initPasswordToggle() {

    const password = document.getElementById("password");
    const button = document.getElementById("togglePassword");

    if (!password || !button) return;

    button.addEventListener("click", () => {

        const hidden = password.type === "password";

        password.type = hidden ? "text" : "password";

        button.innerHTML = hidden
            ? '<i class="bi bi-eye-slash"></i>'
            : '<i class="bi bi-eye"></i>';

    });

}


/* -----------------------------
   Floating Card
----------------------------- */

function startFloatingCard() {

    const card = document.querySelector(".login-card");

    if (!card) return;

    let position = 0;
    let direction = 1;

    setInterval(() => {

        position += direction * 0.25;

        if (position > 8) direction = -1;

        if (position < 0) direction = 1;

        card.style.transform = `translateY(${position}px)`;

    }, 30);

}


/* -----------------------------
   Logo Pulse
----------------------------- */

function startLogoPulse() {

    const logo = document.querySelector(".logo-circle");

    if (!logo) return;

    setInterval(() => {

        logo.animate(

            [
                { transform: "scale(1)" },
                { transform: "scale(1.06)" },
                { transform: "scale(1)" }
            ],

            {
                duration: 1800
            }

        );

    }, 2200);

}


/* -----------------------------
   Floating Particles
----------------------------- */

function createParticles() {

    const container = document.getElementById("particles");

    if (!container) return;

    for (let i = 0; i < 40; i++) {

        const dot = document.createElement("span");

        dot.className = "particle";

        dot.style.left = Math.random() * 100 + "%";

        dot.style.top = Math.random() * 100 + "%";

        dot.style.animationDuration =
            (6 + Math.random() * 8) + "s";

        dot.style.animationDelay =
            Math.random() * 5 + "s";

        container.appendChild(dot);

    }

}


/* -----------------------------
   Overlay Helpers
----------------------------- */

function showLoading() {

    document
        .getElementById("loadingOverlay")
        ?.classList.remove("d-none");

}

function hideLoading() {

    document
        .getElementById("loadingOverlay")
        ?.classList.add("d-none");

}

function showSuccess() {

    hideLoading();

    document
        .getElementById("successOverlay")
        ?.classList.remove("d-none");

}
/* =========================================================
   Chef Bisu Login
   Part 3B - Login Submit
========================================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", loginUser);

}

async function loginUser(event) {

    event.preventDefault();

    showLoading();

    const username = document
        .getElementById("username")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    if (!username || !password) {

        hideLoading();

        alert("Username and Password are required.");

        return;

    }

    try {

        const response = await fetch("/login", {

            method: "POST",

            credentials: "include",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                username,
                password

            })

        });

        const result = await response.json();

        if (!response.ok || !result.success) {

            hideLoading();

            alert(result.message || "Login Failed");

            return;

        }

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(result.user)
        );

        showSuccess();

        setTimeout(() => {

            if (result.user.role === "admin") {

                location.href = "/pages/dashboard.html";

            } else {

                location.href = "/pages/user-dashboard.html";

            }

        }, 1200);

    }

    catch (error) {

        console.error(error);

        hideLoading();

        alert("Unable to connect to server.");

    }

}
/* =========================================================
   Chef Bisu Login
   Part 3C - Premium UI Effects
========================================================= */

/* -----------------------------
   Auto Button Shine
----------------------------- */

const loginButton = document.querySelector(".login-btn");

if (loginButton) {

    setInterval(() => {

        loginButton.classList.add("shine");

        setTimeout(() => {

            loginButton.classList.remove("shine");

        }, 1200);

    }, 3500);

}


/* -----------------------------
   Ripple Click Effect
----------------------------- */

if (loginButton) {

    loginButton.addEventListener("click", function (e) {

        const ripple = document.createElement("span");

        ripple.className = "ripple";

        const rect = this.getBoundingClientRect();

        ripple.style.left = (e.clientX - rect.left) + "px";
        ripple.style.top = (e.clientY - rect.top) + "px";

        this.appendChild(ripple);

        setTimeout(() => {

            ripple.remove();

        }, 700);

    });

}


/* -----------------------------
   Input Focus Glow
----------------------------- */

document
.querySelectorAll(".form-control")
.forEach(input => {

    input.addEventListener("focus", () => {

        input.parentElement.classList.add("input-active");

    });

    input.addEventListener("blur", () => {

        input.parentElement.classList.remove("input-active");

    });

});


/* -----------------------------
   Mouse Parallax
----------------------------- */

document.addEventListener("mousemove", e => {

    const card = document.querySelector(".login-card");

    if (!card) return;

    const x = (window.innerWidth / 2 - e.clientX) / 60;

    const y = (window.innerHeight / 2 - e.clientY) / 60;

    card.style.transform =
        `translate(${ -x }px, ${ -y }px)`;

});


/* -----------------------------
   Page Fade In
----------------------------- */

window.addEventListener("load", () => {

    document.body.style.opacity = "0";

    document.body.style.transition = "opacity .8s ease";

    requestAnimationFrame(() => {

        document.body.style.opacity = "1";

    });

});