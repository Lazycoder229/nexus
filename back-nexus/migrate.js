import db from "./config/db.js";

async function migrate() {
    try {
        console.log("Adding columns to scholarship_applications...");
        await db.query(`
      ALTER TABLE scholarship_applications 
      ADD COLUMN IF NOT EXISTS scholarship_id INT AFTER scholarship_type_id,
      ADD COLUMN IF NOT EXISTS academic_period_id INT AFTER semester
    `);

        console.log("Adding columns to scholarship_beneficiaries...");
        await db.query(`
      ALTER TABLE scholarship_beneficiaries 
      ADD COLUMN IF NOT EXISTS scholarship_id INT AFTER scholarship_type_id,
      ADD COLUMN IF NOT EXISTS academic_period_id INT AFTER semester
    `);

        // Migration for scholarship_eligibility_screening
        console.log("Migrating scholarship_eligibility_screening...");
        await db.query(`ALTER TABLE scholarship_eligibility_screening ADD COLUMN IF NOT EXISTS scholarship_id INT AFTER application_id`);
        await db.query(`ALTER TABLE scholarship_eligibility_screening ADD COLUMN IF NOT EXISTS academic_period_id INT AFTER student_id`);

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
