const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./backend/database/erp.db", (err) => {

    if (err) {
        console.log(err.message);
    } else {
        console.log("Connected to SQLite Database");
    }

});
db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    `);
db.run(`
    INSERT OR IGNORE INTO users (username, password, role)
    VALUES ('admin', '1234', 'admin')
`);
db.run(`
CREATE TABLE IF NOT EXISTS production (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    item TEXT NOT NULL,
    qty REAL NOT NULL,
    unit TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS transfer (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    date TEXT,

    branch TEXT,

    item TEXT,

    qty INTEGER,

    unit TEXT

)
`);
db.run(`
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT UNIQUE NOT NULL
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_name TEXT UNIQUE NOT NULL
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    branch TEXT,
    item TEXT,
    qty TEXT,
    unit TEXT
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS opening_stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT,
    item TEXT,
    opening_qty REAL DEFAULT 0,
    unit TEXT,
    UNIQUE(month, item, unit)
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS store_items (

id INTEGER PRIMARY KEY AUTOINCREMENT,

item_code TEXT UNIQUE,

item_name TEXT NOT NULL UNIQUE,

category TEXT,

brand TEXT,

unit TEXT,

hsn_code TEXT,

gst REAL DEFAULT 0,

purchase_rate REAL DEFAULT 0,

average_rate REAL DEFAULT 0,

min_stock REAL DEFAULT 0,

max_stock REAL DEFAULT 0,

reorder_level REAL DEFAULT 0,

barcode TEXT,

qr_code TEXT,

status TEXT DEFAULT 'ACTIVE',

remarks TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);
db.run(`
CREATE TABLE IF NOT EXISTS categories (

id INTEGER PRIMARY KEY AUTOINCREMENT,

category_code TEXT UNIQUE,

category_name TEXT NOT NULL UNIQUE,

status TEXT DEFAULT 'ACTIVE',

remarks TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);
db.run(`
CREATE TABLE IF NOT EXISTS suppliers(

id INTEGER PRIMARY KEY AUTOINCREMENT,

supplier_code TEXT UNIQUE,

supplier_name TEXT NOT NULL,

contact_person TEXT,

mobile TEXT,

email TEXT,

gstin TEXT,

address TEXT,

city TEXT,

state TEXT,

pincode TEXT,

status TEXT DEFAULT 'ACTIVE',

remarks TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);
db.run(`
CREATE TABLE IF NOT EXISTS number_series(

id INTEGER PRIMARY KEY AUTOINCREMENT,

series_name TEXT UNIQUE,

prefix TEXT,

last_number INTEGER DEFAULT 0,

digit_length INTEGER DEFAULT 6,

status TEXT DEFAULT 'ACTIVE'

)
`);
db.run(`
INSERT OR IGNORE INTO number_series
(series_name,prefix,last_number,digit_length)
VALUES
('STORE_ITEM','SI',0,6),
('SUPPLIER','SUP',0,6),
('PURCHASE','PUR',0,6),
('PRODUCTION','PRO',0,6),
('TRANSFER','TRN',0,6),
('SALES','SAL',0,6),
('DAMAGE','DMG',0,6),
('STOCK','STK',0,6)
`);
db.run(`
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_code TEXT UNIQUE,
    supplier_name TEXT NOT NULL UNIQUE,
    mobile TEXT,
    gst_number TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS store_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_code TEXT UNIQUE,
    item_name TEXT NOT NULL UNIQUE,
    unit TEXT,
    gst_percent REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_no TEXT UNIQUE,
    purchase_date TEXT,
    supplier_id INTEGER,
    total_amount REAL DEFAULT 0,
    total_gst REAL DEFAULT 0,
    grand_total REAL DEFAULT 0,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER,
    item_id INTEGER,
    qty REAL,
    unit TEXT,
    rate REAL,
    gst_percent REAL,
    gst_amount REAL,
    amount REAL
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'User'
)
`);

db.run(`
INSERT OR IGNORE INTO users (username, password, role)
VALUES ('admin', '1234', 'Admin')
`);
db.run(`
CREATE TABLE IF NOT EXISTS edit_requests (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_id INTEGER NOT NULL,

    requested_by TEXT NOT NULL,

    status TEXT DEFAULT 'Pending',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);
});
module.exports = db;