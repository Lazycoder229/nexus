import db from "./back-nexus/config/db.js";

async function checkAppSchema() {
    try {
        const [cols] = await db.query("DESCRIBE scholarship_applications");
        console.log("scholarship_applications columns:", cols.map(c => c.Field));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAppSchema();
