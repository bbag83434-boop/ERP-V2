"use strict";

/* ==========================================
   Chef Bisu Login v2
   Final JS - Part 1
========================================== */

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

const loadingOverlay = document.getElementById("loadingOverlay");
const successOverlay = document.getElementById("successOverlay");

/* ==========================================
   Start
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    checkSession();

    initPasswordToggle();

});


/* ==========================================
   Session Check
========================================== */

async function checkSession(){

    try{

        const response = await fetch("/session",{

            credentials:"include"

        });

        const result = await response.json();

        if(!result.loggedIn){

            return;

        }

        showLoading();

        setTimeout(()=>{

            redirectUser(result.user.role);

        },800);

    }

    catch(error){

        console.error(error);

    }

}


/* ==========================================
   Password Toggle
========================================== */

function initPasswordToggle(){

    if(!togglePassword) return;

    togglePassword.addEventListener("click",()=>{

        if(passwordInput.type==="password"){

            passwordInput.type="text";

            togglePassword.innerHTML='<i class="bi bi-eye-slash"></i>';

        }

        else{

            passwordInput.type="password";

            togglePassword.innerHTML='<i class="bi bi-eye"></i>';

        }

    });

}


/* ==========================================
   Login Submit
========================================== */

if(loginForm){

loginForm.addEventListener("submit",loginUser);

}

async function loginUser(e){

    e.preventDefault();

    const username=usernameInput.value.trim();

    const password=passwordInput.value;

    if(username===""||password===""){

        alert("Please enter username and password.");

        return;

    }

    showLoading();

    try{

        const response=await fetch("/login",{

            method:"POST",

            credentials:"include",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                username,

                password

            })

        });

        const result=await response.json();

        if(!response.ok||!result.success){

            hideLoading();

            alert(result.message||"Login failed");

            return;

        }

        localStorage.setItem(

            "loggedInUser",

            JSON.stringify(result.user)

        );

        showSuccess();

        setTimeout(()=>{

            redirectUser(result.user.role);

        },1200);

    }

    catch(error){

        hideLoading();

        alert("Server Error");

        console.error(error);

    }

}


/* ==========================================
   Redirect
========================================== */

function redirectUser(role){

    if(role==="admin"){

        location.href="/pages/dashboard.html";

    }

    else{

        location.href="/pages/user-dashboard.html";

    }

}


/* ==========================================
   Overlay
========================================== */

function showLoading(){

    loadingOverlay?.classList.remove("d-none");

}

function hideLoading(){

    loadingOverlay?.classList.add("d-none");

}

function showSuccess(){

    hideLoading();

    successOverlay?.classList.remove("d-none");

}
/* =========================================================
   Chef Bisu Login v2
   Final JS - Part 2 (Premium Animation)
========================================================= */

/* -----------------------------
   Initialize Effects
----------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    createParticles();

    startFloatingCard();

    startLogoPulse();

    startButtonGlow();

    startMouseParallax();

});


/* -----------------------------
   Floating Particles
----------------------------- */

function createParticles(){

    const container=document.getElementById("particles");

    if(!container) return;

    container.innerHTML="";

    for(let i=0;i<45;i++){

        const p=document.createElement("span");

        p.className="particle";

        p.style.left=Math.random()*100+"%";

        p.style.top=(60+Math.random()*40)+"%";

        p.style.animationDuration=(6+Math.random()*8)+"s";

        p.style.animationDelay=Math.random()*5+"s";

        p.style.opacity=(.2+Math.random()*.5);

        container.appendChild(p);

    }

}


/* -----------------------------
   Floating Card
----------------------------- */

function startFloatingCard(){

    const card=document.querySelector(".login-card");

    if(!card) return;

    let t=0;

    function animate(){

        t+=0.02;

        const y=Math.sin(t)*8;

        card.style.transform=`translateY(${y}px)`;

        requestAnimationFrame(animate);

    }

    animate();

}


/* -----------------------------
   Logo Pulse
----------------------------- */

function startLogoPulse(){

    const logo=document.querySelector(".logo-box");

    if(!logo) return;

    setInterval(()=>{

        logo.animate(

            [

                {transform:"scale(1)"},

                {transform:"scale(1.06)"},

                {transform:"scale(1)"}

            ],

            {

                duration:1800,

                easing:"ease-in-out"

            }

        );

    },2400);

}


/* -----------------------------
   Auto Button Glow
----------------------------- */

function startButtonGlow(){

    const button=document.querySelector(".login-btn");

    if(!button) return;

    setInterval(()=>{

        button.classList.add("shine");

        setTimeout(()=>{

            button.classList.remove("shine");

        },1000);

    },3500);

}


/* -----------------------------
   Mouse Parallax
----------------------------- */

function startMouseParallax(){

    const card=document.querySelector(".login-card");

    if(!card) return;

    document.addEventListener("mousemove",(e)=>{

        const x=(window.innerWidth/2-e.clientX)/45;

        const y=(window.innerHeight/2-e.clientY)/45;

        card.style.transform=

        `translate(${-x}px,${-y}px)`;

    });

}


/* -----------------------------
   Keyboard Enter Support
----------------------------- */

document.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        loginForm?.requestSubmit();

    }

});


/* -----------------------------
   Prevent Double Submit
----------------------------- */

let submitting=false;

if(loginForm){

loginForm.addEventListener("submit",(e)=>{

    if(submitting){

        e.preventDefault();

        return;

    }

    submitting=true;

    setTimeout(()=>{

        submitting=false;

    },2500);

});

}