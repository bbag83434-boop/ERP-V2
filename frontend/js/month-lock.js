const $ = (id) => document.getElementById(id);
const toast = new bootstrap.Toast($("appToast"), { delay: 3000 });
function showMessage(message) { $("toastMessage").textContent = message; toast.show(); }
function getError(data, fallback) { return data && data.message ? data.message : fallback; }
async function readJson(url, options) { const response = await fetch(url, options); const data = await response.json(); if (!response.ok) throw new Error(getError(data, "অনুরোধ সম্পন্ন হয়নি")); return data; }
async function loadLockedMonths() {
    const target = $("lockedMonths"); target.innerHTML = '<div class="empty">Loading...</div>';
    try {
        const months = await readJson("/api/production/locked-months");
        target.innerHTML = months.length ? months.map((month) => `<div class="lock-row"><div class="lock-icon"><i class="bi bi-lock-fill"></i></div><div class="lock-month">${month}</div><button class="btn btn-sm btn-outline-danger ms-auto unlock-button" data-month="${month}">Unlock</button></div>`).join("") : '<div class="empty">কোনো মাস Lock করা নেই।</div>';
    } catch (error) { target.innerHTML = '<div class="empty">তালিকা লোড করা যায়নি।</div>'; showMessage(error.message); }
}
$("lockButton").addEventListener("click", async () => { const month = $("lockMonth").value; if (!month) return showMessage("একটি মাস নির্বাচন করুন।"); if (!confirm(`${month} মাস Lock করতে চান?`)) return; try { const data = await readJson("/api/production/lock-month", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({month}) }); showMessage(data.message); loadLockedMonths(); } catch (error) { showMessage(error.message); } });
$("createMonthButton").addEventListener("click", async () => { const fromMonth=$("fromMonth").value, toMonth=$("toMonth").value; if (!fromMonth || !toMonth) return showMessage("দুইটি মাস নির্বাচন করুন।"); if (fromMonth === toMonth) return showMessage("দুইটি মাস আলাদা হতে হবে।"); if (!confirm(`${fromMonth} থেকে ${toMonth} মাসের opening stock তৈরি করবেন?`)) return; try { const data=await readJson("/api/production/create-month", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fromMonth,toMonth})}); showMessage(data.message); } catch(error) { showMessage(error.message); } });
$("lockedMonths").addEventListener("click", async (event) => { const button=event.target.closest(".unlock-button"); if (!button || !confirm(`${button.dataset.month} মাস Unlock করতে চান?`)) return; try { const data=await readJson("/api/production/unlock-month",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({month:button.dataset.month})}); showMessage(data.message); loadLockedMonths(); } catch(error) { showMessage(error.message); } });
$("refreshButton").addEventListener("click", loadLockedMonths); $("backButton").addEventListener("click", () => location.href="dashboard.html"); loadLockedMonths();
