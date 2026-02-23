import db from "../config/db.js";

const Invoice = {
  // Create new invoice
  create: async (data) => {
    const query = `
      INSERT INTO student_invoices 
      (invoice_number, student_id, enrollment_id, academic_period_id, 
       tuition_fee, laboratory_fee, library_fee, athletic_fee, 
       registration_fee, id_fee, miscellaneous_fee, other_fees,
       subtotal, discount_amount, scholarship_amount, total_amount, 
       invoice_date, due_date, status, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(
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
      ]
    );
    return result;
  },

  // Get all invoices with filters
  getAll: async (filters) => {
    let query = `
      SELECT 
        si.*,
        (si.total_amount - si.amount_paid) AS balance,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        sd.student_number,
        p.name as program_name,
        ap.school_year,
        ap.semester,
        CONCAT(c.first_name, ' ', c.last_name) as created_by_name
      FROM student_invoices si
      INNER JOIN users s ON si.student_id = s.user_id
      LEFT JOIN student_details sd ON s.user_id = sd.user_id
      LEFT JOIN enrollments e ON si.enrollment_id = e.enrollment_id
      LEFT JOIN programs p ON sd.course = p.name
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
      if (filters.status.includes(",")) {
        const statuses = filters.status.split(",");
        query += " AND si.status IN (?)";
        params.push(statuses);
      } else {
        query += " AND si.status = ?";
        params.push(filters.status);
      }
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

    const [rows] = await db.query(query, params);
    return rows;
  },

  // Get invoice by ID
  getById: async (id) => {
    const query = `
      SELECT 
        si.*,
        (si.total_amount - si.amount_paid) AS balance,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.email as student_email,
        sd.student_number,
        sd.year_level,
        p.name as program_name,
        p.code as program_code,
        ap.school_year,
        ap.semester,
        CONCAT(c.first_name, ' ', c.last_name) as created_by_name
      FROM student_invoices si
      INNER JOIN users s ON si.student_id = s.user_id
      LEFT JOIN student_details sd ON s.user_id = sd.user_id
      LEFT JOIN enrollments e ON si.enrollment_id = e.enrollment_id
      LEFT JOIN programs p ON sd.course = p.name
      LEFT JOIN academic_periods ap ON si.academic_period_id = ap.period_id
      LEFT JOIN users c ON si.created_by = c.user_id
      WHERE si.invoice_id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows;
  },

  // Get invoices by student
  getByStudent: async (student_id) => {
    const query = `
      SELECT 
        si.*,
        (si.total_amount - si.amount_paid) AS balance,
        ap.school_year,
        ap.semester
      FROM student_invoices si
      LEFT JOIN academic_periods ap ON si.academic_period_id = ap.period_id
      WHERE si.student_id = ?
      ORDER BY si.invoice_date DESC
    `;
    const [rows] = await db.query(query, [student_id]);
    return rows;
  },

  // Update invoice
  update: async (id, data) => {
    const query = `
      UPDATE student_invoices 
      SET student_id = ?, enrollment_id = ?, academic_period_id = ?,
          tuition_fee = ?, laboratory_fee = ?, library_fee = ?, athletic_fee = ?,
          registration_fee = ?, id_fee = ?, miscellaneous_fee = ?, other_fees = ?,
          subtotal = ?, discount_amount = ?, scholarship_amount = ?, 
          total_amount = ?, due_date = ?, status = ?, notes = ?
      WHERE invoice_id = ?
    `;
    const [result] = await db.query(
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
      ]
    );
    return result;
  },

  // Update payment amount
  updatePayment: async (id, amount) => {
    const query = `
      UPDATE student_invoices 
      SET amount_paid = amount_paid + ?
      WHERE invoice_id = ?
    `;
    const [result] = await db.query(query, [amount, id]);
    return result;
  },

  // Update invoice status
  updateStatus: async (id, status) => {
    const query = "UPDATE student_invoices SET status = ? WHERE invoice_id = ?";
    const [result] = await db.query(query, [status, id]);
    return result;
  },

  // Delete invoice
  delete: async (id) => {
    const query = "DELETE FROM student_invoices WHERE invoice_id = ?";
    const [result] = await db.query(query, [id]);
    return result;
  },

  // Generate invoice number
  generateInvoiceNumber: async () => {
    const query = `
      SELECT invoice_number FROM student_invoices 
      ORDER BY invoice_id DESC LIMIT 1
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  // Get financial summary
  getFinancialSummary: async (filters) => {
    let query = `
      SELECT 
        COUNT(*) as total_invoices,
        SUM(total_amount) as total_billed,
        SUM(amount_paid) as total_paid,
        SUM(total_amount - amount_paid) as total_balance,
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

    const [rows] = await db.query(query, params);
    return rows;
  },
};

export default Invoice;
