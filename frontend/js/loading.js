const loadingOverlay=document.getElementById("loadingOverlay");

const successOverlay=document.getElementById("successOverlay");

function showLoading(title="Saving Production...",text="Please wait..."){

document.getElementById("loadingTitle").textContent=title;

document.getElementById("loadingText").textContent=text;

loadingOverlay.style.display="flex";

}

function hideLoading(){

loadingOverlay.style.display="none";

}

function showSuccess(title = "Success", text = "Completed Successfully") {

    hideLoading();

    document.querySelector("#successOverlay h5").textContent = title;
    document.querySelector("#successOverlay p").textContent = text;

    successOverlay.style.display = "flex";

    setTimeout(() => {

        successOverlay.style.display = "none";

    }, 1500);

}
function showError(title = "Failed", text = "Something went wrong") {

    hideLoading();

    const successBox = document.querySelector("#successOverlay .loading-box");

    successBox.innerHTML = `
        <div style="
            width:70px;
            height:70px;
            margin:auto;
            border-radius:50%;
            background:#dc3545;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:38px;
            color:#fff;
        ">
            ✕
        </div>

        <h5 style="margin-top:18px;color:#fff;">
            ${title}
        </h5>

        <p style="color:#9ca3af;">
            ${text}
        </p>
    `;

    successOverlay.style.display = "flex";

    setTimeout(() => {

        successOverlay.style.display = "none";

        location.reload();

    }, 1800);

}