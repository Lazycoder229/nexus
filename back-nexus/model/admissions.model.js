// model/admissions.model.js
import db from "../config/db.js";

// Get all admissions
export const getAllAdmissions = async () => {
  const [rows] = await db.query(
    `SELECT 
        a.*,
        CONCAT(u.first_name, ' ', u.last_name) AS decision_by_name
     FROM admissions a
     LEFT JOIN users u ON a.decision_by = u.user_id
     ORDER BY a.created_at DESC`
  );
  return rows;
};

// Get single admission
export const getAdmissionById = async (id) => {
  const [rows] = await db.query(
    `SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) AS decision_by_name
     FROM admissions a
     LEFT JOIN users u ON a.decision_by = u.user_id
     WHERE a.admission_id = ?`,
    [id]
  );
  return rows[0];
};

// Create admission
export const createAdmission = async (data) => {
  const [result] = await db.query(
    `INSERT INTO admissions 
     (first_name, middle_name, last_name, email, phone, date_of_birth, gender, address,
      previous_school, year_graduated, program_applied, application_date, entrance_exam_score,
      interview_date, interview_notes, status, decision_date, decision_by, remarks, documents_submitted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.first_name,
      data.middle_name,
      data.last_name,
      data.email,
      data.phone,
      data.date_of_birth,
      data.gender,
      data.address,
      data.previous_school,
      data.year_graduated,
      data.program_applied,
      data.application_date,
      data.entrance_exam_score,
      data.interview_date,
      data.interview_notes,
      data.status || "Pending",
      data.decision_date,
      data.decision_by,
      data.remarks,
      data.documents_submitted,
    ]
  );
  return getAdmissionById(result.insertId);
};

// Update admission
export const updateAdmission = async (id, data) => {
  await db.query(
    `UPDATE admissions SET
      first_name = ?, middle_name = ?, last_name = ?, email = ?, phone = ?,
      date_of_birth = ?, gender = ?, address = ?, previous_school = ?,
      year_graduated = ?, program_applied = ?, application_date = ?,
      entrance_exam_score = ?, interview_date = ?, interview_notes = ?,
      status = ?, decision_date = ?, decision_by = ?, remarks = ?, documents_submitted = ?
     WHERE admission_id = ?`,
    [
      data.first_name,
      data.middle_name,
      data.last_name,
      data.email,
      data.phone,
      data.date_of_birth,
      data.gender,
      data.address,
      data.previous_school,
      data.year_graduated,
      data.program_applied,
      data.application_date,
      data.entrance_exam_score,
      data.interview_date,
      data.interview_notes,
      data.status,
      data.decision_date,
      data.decision_by,
      data.remarks,
      data.documents_submitted,
      id,
    ]
  );
  return getAdmissionById(id);
};

// Delete admission
export const deleteAdmission = async (id) => {
  await db.query(`DELETE FROM admissions WHERE admission_id = ?`, [id]);
  return true;
};
