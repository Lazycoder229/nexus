import mysql from "mysql2/promise";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),

  ssl: {
    ca: fs.readFileSync("./config/ca.pem"),
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("MySQL pool initialized");

export default db;