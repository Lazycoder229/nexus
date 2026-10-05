import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 10000,
});

console.log("MySQL pool initialized");

const ensureVerificationSchema = async () => {
  try {
    const [columns] = await db.query(
      `SHOW COLUMNS FROM users LIKE 'is_verified'`
    );

    if (columns.length === 0) {
      console.log("Adding email verification columns to users table...");

      await db.query(`
        ALTER TABLE users
        ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER status,
        ADD COLUMN verification_expires_at DATETIME NULL DEFAULT NULL AFTER verification_code,
        ADD COLUMN email_verified_at DATETIME NULL DEFAULT NULL AFTER verification_expires_at
      `);

      await db.query(`
        UPDATE users
        SET
          is_verified = 1,
          email_verified_at = CURRENT_TIMESTAMP
        WHERE
          (is_verified IS NULL OR is_verified = 0)
          AND status = 'Active'
      `);

      console.log(
        "Email verification columns successfully added to users table."
      );
    } else {
      console.log("Email verification schema already exists.");
    }
  } catch (err) {
    const details = err?.message || err?.code || "Unknown database error";

    console.warn("⚠️ Database schema check notice:", details);

    if (err?.code === "ECONNREFUSED") {
      console.warn(
        "Start MySQL or check DB_HOST/DB_PORT in your .env file."
      );
    }

    if (err?.code === "ETIMEDOUT") {
      console.warn(
        "MySQL connection timed out. Check DB_HOST, DB_PORT, firewall, VPN, or remote MySQL availability."
      );
    }
  }
};

ensureVerificationSchema();

export default db;