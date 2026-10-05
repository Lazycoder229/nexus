import db from "../config/db.js";

export const addYearLevelToAdmissions = async () => {
  try {
    // Check if year_level column already exists
    const [columns] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'admissions' AND COLUMN_NAME = 'year_level'`
    );

    if (columns.length === 0) {
      await db.query(`
        ALTER TABLE admissions
        ADD COLUMN year_level VARCHAR(50) DEFAULT '1st Year' AFTER program_applied
      `);
      console.log("✓ Successfully added year_level column to admissions table");
    } else {
      console.log("year_level column already exists in admissions table");
    }

    // Backfill year_level from student_details if available, handling collation
    await db.query(`
      UPDATE admissions a
      INNER JOIN users u ON a.email = u.email COLLATE utf8mb4_unicode_ci
      INNER JOIN student_details sd ON u.user_id = sd.user_id
      SET a.year_level = sd.year_level
      WHERE sd.year_level IS NOT NULL AND sd.year_level != ''
    `);
    console.log("✓ Updated admissions year_level from existing student_details");

  } catch (error) {
    console.error("Error adding year_level column to admissions:", error);
    throw error;
  }
};

addYearLevelToAdmissions()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
