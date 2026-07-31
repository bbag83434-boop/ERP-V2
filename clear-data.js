/* ==========================================
   CHEF BISU - CLEAR TEST DATA (ONE-TIME SCRIPT)
   এই স্ক্রিপ্ট শুধু নিচের ৪টি টেবিলের ডেটা মুছবে:
   production, transfers, wastage, opening_stock
   (items, branches, locked_months অপরিবর্তিত থাকবে)

   চালানোর নিয়ম (টার্মিনালে, প্রজেক্টের root ফোল্ডার থেকে):
       node clear-data.js
========================================== */

"use strict";

const db = require("./backend/config/db"); // server.js এর সাথে একই লেভেলে বসাও

const tables = ["production", "transfers", "wastage", "opening_stock"];

let completed = 0;

console.log("⚠️  Clearing test data... এই কাজটি Undo করা যাবে না।\n");

tables.forEach((table) => {

    db.run(`DELETE FROM ${table}`, [], function (err) {

        completed++;

        if (err) {
            console.error(`❌ ${table} মুছতে ব্যর্থ:`, err.message);
        } else {
            console.log(`✅ ${table} টেবিলের সব ডেটা মুছে ফেলা হয়েছে (${this.changes} rows deleted)`);
        }

        if (completed === tables.length) {
            console.log("\n🎉 সব টেবিল ক্লিয়ার হয়ে গেছে। এখন Original ডেটা এন্ট্রি শুরু করতে পারো।");
            process.exit(0);
        }

    });

});