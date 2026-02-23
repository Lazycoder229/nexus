import db from "./back-nexus/config/db.js";

async function checkSchema() {
    try {
        const [progCols] = await db.query("DESCRIBE scholarship_programs");
        console.log("scholarship_programs columns:", progCols.map(c => c.Field));

        const [typeCols] = await db.query("DESCRIBE scholarship_types");
        console.log("scholarship_types columns:", typeCols.map(c => c.Field));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
