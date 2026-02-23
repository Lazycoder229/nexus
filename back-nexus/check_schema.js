import db from "./config/db.js";

async function checkSchema() {
    try {
        const tables = ["scholarship_applications", "scholarship_beneficiaries", "scholarship_programs", "scholarship_eligibility_screening"];
        for (const table of tables) {
            console.log(`\n--- ${table} ---`);
            const [cols] = await db.query(`DESCRIBE ${table}`);
            console.log(cols.map(c => c.Field).join(", "));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
