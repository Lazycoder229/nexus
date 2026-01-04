import db from "../config/db.js";

const Invoice = {
  // Create new invoice
  create: (data, callback) => {
    const query = `
      INSERT INTO student_invoices 
      (invoice_number, student_id, enrollment_id, academic_period_id, 
       tuition_fee, laboratory_fee, library_fee, athletic_fee, 
       registration_fee, id_fee, miscellaneous_fee, other_fees,
       subtotal, discount_amount, scholarship_amount, total_amount, 
       invoice_date, due_date, status, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      query,
      [
        data.invoice_number,
        data.student_id,
        data.enrollment_id,
        data.academic_period_id,
        data.tuition_fee || 0,
        data.laboratory_fee || 0,
        data.library_fee || 0,
        data.athletic_fee || 0,
        data.registration_fee || 0,
        data.id_fee || 0,
        data.miscellaneous_fee || 0,
        data.other_fees || 0,
        data.subtotal,
        data.discount_amount || 0,
        data.scholarship_amount || 0,
        data.total_amount,
        data.invoice_date,
        data.due_date,
        data.status || "Pending",
        data.notes,
        data.created_by,
      ],
      callback
    );
  },

  // Get all invoices with filters
  getAll: (filters, callback) => {
    let query = `
      SELECT 
        si.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        sd.student_number,
        p.program_name,
        ap.school_year,
        ap.semester,
        CONCAT(c.first_name, ' ', c.last_name) as created_by_name
      FROM student_invoices si
      INNER JOIN users s ON si.student_id = s.user_id
      LEFT JOIN student_details sd ON s.user_id = sd.user_id
      LEFT JOIN enrollments e ON si.enrollment_id = e.enrollment_id
      LEFT JOIN programs p ON e.program_id = p.program_id
      LEFT JOIN academic_periods ap ON si.academic_period_id = ap.period_id
      LEFT JOIN users c ON si.created_by = c.user_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.student_id) {
      query += " AND si.student_id = ?";
      params.push(filters.student_id);
    }
    if (filters.academic_period_id) {
      query += " AND si.academic_period_id = ?";
      params.push(filters.academic_period_id);
    }
    if (filters.status) {
      query += " AND si.status = ?";
      params.push(filters.status);
    }
    if (filters.search) {
      query += ` AND (si.invoice_number LIKE ? OR 
                      CONCAT(s.first_name, ' ', s.last_name) LIKE ? OR 
                      sd.student_number LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY si.created_at DESC";

    if (filters.limit) {
      query += " LIMIT ? OFFSET ?";
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    db.query(query, params, callback);
  },

  // Get invoice by ID
  getById: (id, callback) => {
    const query = `
      SELECT 
        si.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.email as student_email,
        sd.student_number,
        sd.year_level,
        p.program_name,
        p.program_code,
        ap.school_year,
        ap.semester,
        CONCAT(c.first_name, ' ', c.last_name) as created_by_name
      FROM student_invoices si
      INNER JOIN users s ON si.student_id = s.user_id
      LEFT JOIN student_details sd ON s.user_id = sd.user_id
      LEFT JOIN enrollments e ON si.enrollment_id = e.enrollment_id
      LEFT JOIN programs p ON e.program_id = p.program_id
      LEFT JOIN academic_periods ap ON si.academic_period_id = ap.period_id
      LEFT JOIN users c ON si.created_by = c.user_id
      WHERE si.invoice_id = ?
    `;
    db.query(query, [id], callback);
  },

  // Get invoices by student
  getByStudent: (student_id, callback) => {
    const query = `
      SELECT 
        si.*,
        ap.school_year,
        ap.semester
      FROM student_invoices si
      LEFT JOIN academic_periods ap ON si.academic_period_id = ap.period_id
      WHERE si.student_id = ?
      ORDER BY si.invoice_date DESC
    `;
    db.query(query, [student_id], callback);
  },

  // Update invoice
  update: (id, data, callback) => {
    const query = `
      UPDATE student_invoices 
      SET student_id = ?, enrollment_id = ?, academic_period_id = ?,
          tuition_fee = ?, laboratory_fee = ?, library_fee = ?, athletic_fee = ?,
          registration_fee = ?, id_fee = ?, miscellaneous_fee = ?, other_fees = ?,
          subtotal = ?, discount_amount = ?, scholarship_amount = ?, 
          total_amount = ?, due_date = ?, status = ?, notes = ?
      WHERE invoice_id = ?
    `;
    db.query(
      query,
      [
        data.student_id,
        data.enrollment_id,
        data.academic_period_id,
        data.tuition_fee || 0,
        data.laboratory_fee || 0,
        data.library_fee || 0,
        data.athletic_fee || 0,
        data.registration_fee || 0,
        data.id_fee || 0,
        data.miscellaneous_fee || 0,
        data.other_fees || 0,
        data.subtotal,
        data.discount_amount || 0,
        data.scholarship_amount || 0,
        data.total_amount,
        data.due_date,
        data.status,
        data.notes,
        id,
      ],
      callback
    );
  },

  // Update payment amount
  updatePayment: (id, amount, callback) => {
    const query = `
      UPDATE student_invoices 
      SET amount_paid = amount_paid + ?
      WHERE invoice_id = ?
    `;
    db.query(query, [amount, id], callback);
  },

  // Update invoice status
  updateStatus: (id, status, callback) => {
    const query = "UPDATE student_invoices SET status = ? WHERE invoice_id = ?";
    db.query(query, [status, id], callback);
  },

  // Delete invoice
  delete: (id, callback) => {
    const query = "DELETE FROM student_invoices WHERE invoice_id = ?";
    db.query(query, [id], callback);
  },

  // Generate invoice number
  generateInvoiceNumber: (callback) => {
    const query = `
      SELECT invoice_number FROM student_invoices 
      ORDER BY invoice_id DESC LIMIT 1
    `;
    db.query(query, [], callback);
  },

  // Get financial summary
  getFinancialSummary: (filters, callback) => {
    let query = `
      SELECT 
        COUNT(*) as total_invoices,
        SUM(total_amount) as total_billed,
        SUM(amount_paid) as total_paid,
        SUM(balance) as total_balance,
        SUM(CASE WHEN status = 'Paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN status = 'Overdue' THEN 1 ELSE 0 END) as overdue_count
      FROM student_invoices
      WHERE 1=1
    `;
    const params = [];

    if (filters.academic_period_id) {
      query += " AND academic_period_id = ?";
      params.push(filters.academic_period_id);
    }
    if (filters.start_date && filters.end_date) {
      query += " AND invoice_date BETWEEN ? AND ?";
      params.push(filters.start_date, filters.end_date);
    }

    db.query(query, params, callback);
  },
};

export default Invoice;
