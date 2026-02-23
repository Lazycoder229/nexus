import pool from './back-nexus/config/db.js';

async function testInsert() {
    try {
        console.log('Testing insertion into scholarship_applications with NULL scholarship_type_id...');

        const query = `
      INSERT INTO scholarship_applications (
        scholarship_id, scholarship_type_id, student_id, application_number, application_date,
        academic_period_id, academic_year, semester, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        // Using dummy but valid-ish data
        // Assuming scholarship_id 1 and student_id 1 exist or don't have FK constraints that would block this (we checked FKs earlier, scholarship_type_id has MUL but we'll see)
        const [result] = await pool.query(query, [
            1, null, 1, 'TEST-APP-NULL', '2026-02-23',
            1, '2025-2026', '1st Semester', 'Pending'
        ]);

        console.log('Successfully inserted record! ID:', result.insertId);

        // Cleanup
        await pool.query('DELETE FROM scholarship_applications WHERE application_id = ?', [result.insertId]);
        console.log('Test record cleaned up.');

        process.exit(0);
    } catch (error) {
        console.error('Insert failed:', error);
        process.exit(1);
    }
}

testInsert();
