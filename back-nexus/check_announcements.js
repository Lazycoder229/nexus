import db from "./config/db.js";

async function checkAnnouncementsSchema() {
    try {
        console.log(`\n--- announcements ---`);
        const [cols] = await db.query(`DESCRIBE announcements`);
        console.table(cols);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAnnouncementsSchema();
