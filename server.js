const express=require("express");

const cors=require("cors");
require("./backend/config/db");
const app=express();
app.use(cors());
const port=3000;
const authRoutes=require("./backend/routes/auth.routes");
const productionRoutes = require("./backend/routes/production.routes");
const transferRoutes = require("./backend/routes/transfer.routes");
const supplierRoutes = require("./backend/routes/supplier.routes");
const storeItemRoutes = require("./backend/routes/store-item.routes");
const purchaseRoutes =
require("./backend/routes/purchase.routes");
app.use(express.json());
const path = require("path");

app.use(
    express.static(
        path.join(__dirname, "frontend")
    )
);
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "pages", "login.html"));
});
app.use("/",authRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/store-items", storeItemRoutes);

app.listen(port,()=>{
    console.log("server is running...");
});
