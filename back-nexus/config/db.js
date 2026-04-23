// config/db.js
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "sql308.infinityfree.com",
  user: "if0_41735607",
  password: "Lazycoder122",
  database: "if0_41735607_nexus",
  waitForConnections: true,
  connectionLimit: 10, // max 10 simultaneous connections
  queueLimit: 0,
});

console.log("Connected to MySQL database (pool)!");

export default db;
