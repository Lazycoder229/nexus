import bcrypt from "bcrypt";
import db from "./config/db.js";

async function createTestUser() {
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash("admin123", 10);

    // Check if user already exists
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      ["admin@nexus.com"]
    );

    if (existingUsers.length > 0) {
      console.log("❌ User already exists!");
      process.exit(0);
    }

    // Create admin user
    const [userResult] = await db.query(
      `INSERT INTO users 
       (email, password_hash, role, first_name, last_name, phone, permanent_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        "admin@nexus.com",
        passwordHash,
        "Admin",
        "Admin",
        "User",
        "1234567890",
        "Admin Address",
      ]
    );

    const userId = userResult.insertId;

    // Create employee details for admin
    await db.query(
      `INSERT INTO employee_details 
       (user_id, employee_id, position_title, department, access_level)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, "EMP001", "System Administrator", "IT Department", "admin"]
    );

    console.log("✅ Test admin user created successfully!");
    console.log("📧 Email: admin@nexus.com");
    console.log("🔑 Password: admin123");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    process.exit(1);
  }
}

createTestUser();
