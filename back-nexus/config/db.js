// config/db.js
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "nexusbcc",
  password: "plantobe",
  database: "nexus",
  waitForConnections: true,
  connectionLimit: 10, // max 10 simultaneous connections
  queueLimit: 0,
});

console.log("Connected to MySQL database (pool)!");

export default db;
