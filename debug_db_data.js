import pool from "./back-nexus/config/db.js";

async function check() {
    try {
        const [prog] = await pool.query("SELECT scholarship_id, scholarship_name FROM scholarship_programs LIMIT 5");
        const [per] = await pool.query("SELECT period_id, school_year, semester FROM academic_periods LIMIT 5");
        const [stu] = await pool.query("SELECT user_id, first_name, last_name FROM users WHERE role='Student' LIMIT 5");

        console.log("--- Programs ---");
        console.table(prog);
        console.log("--- Periods ---");
        console.table(per);
        console.log("--- Students ---");
        console.table(stu);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
