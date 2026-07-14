// ==========================================
// ERP V2
// Supplier Master
// ==========================================

const API = "http://localhost:3000/api/suppliers";

// =============================
// Load Supplier List
// =============================
async function loadSuppliers() {

    try {

        const res = await fetch(API);

        const result = await res.json();

        const tbody = document.getElementById("supplierTableBody");

        tbody.innerHTML = "";

        result.data.forEach(supplier => {

            tbody.innerHTML += `
            <tr>

                <td>${supplier.supplier_code}</td>

                <td>${supplier.supplier_name}</td>

                <td>${supplier.mobile}</td>

                <td>${supplier.gstin}</td>

                <td>${supplier.city}</td>

                <td>${supplier.status}</td>

                <td>

                    <button>Edit</button>

                    <button>Delete</button>

                </td>

            </tr>
            `;

        });

    } catch (err) {

        console.log(err);

    }

}

// =============================
// Save Supplier
// =============================
document.getElementById("saveSupplierBtn")
.addEventListener("click", saveSupplier);

async function saveSupplier() {

    const supplier = {

        supplier_name: document.getElementById("supplierName").value.trim(),

        contact_person: document.getElementById("contactPerson").value.trim(),

        mobile: document.getElementById("mobile").value.trim(),

        email: document.getElementById("email").value.trim(),

        gstin: document.getElementById("gstin").value.trim(),

        address: document.getElementById("address").value.trim(),

        city: document.getElementById("city").value.trim(),

        state: document.getElementById("state").value.trim(),

        pincode: document.getElementById("pincode").value.trim(),

        status: document.getElementById("status").value

    };

    if (!supplier.supplier_name) {

        alert("Supplier Name Required");

        return;

    }

    const res = await fetch(API, {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(supplier)

    });

    const result = await res.json();

    alert(result.message);

    loadSuppliers();

}

loadSuppliers();