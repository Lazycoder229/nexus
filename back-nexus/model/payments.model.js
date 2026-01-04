import db from "../config/db.js";

const Payment = {
  // Create new payment
  create: (data, callback) => {
    const query = `
      INSERT INTO payment_collections 
      (payment_reference, invoice_id, student_id, amount_paid, payment_method,
       payment_date, bank_name, check_number, reference_number, payment_status,
       receipt_number, notes, collected_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      query,
      [
        data.payment_reference,
        data.invoice_id,
        data.student_id,
        data.amount_paid,
        data.payment_method,
        data.payment_date,
        data.bank_name,
        data.check_number,
        data.reference_number,
        data.payment_status || "Pending",
        data.receipt_number,
        data.notes,
        data.collected_by,
      ],
      callback
    );
  },

  // Get all payments with filters
  getAll: (filters, callback) => {
    let query = `
      SELECT 
        pc.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        sd.student_number,
        si.invoice_number,
        si.total_amount as invoice_total,
        si.balance as invoice_balance,
        CONCAT(c.first_name, ' ', c.last_name) as collected_by_name,
        CONCAT(v.first_name, ' ', v.last_name) as verified_by_name
      FROM payment_collections pc
      INNER JOIN users s ON pc.student_id = s.user_id
      LEFT JOIN student_details sd ON s.user_id = sd.user_id
      INNER JOIN student_invoices si ON pc.invoice_id = si.invoice_id
      LEFT JOIN users c ON pc.collected_by = c.user_id
      LEFT JOIN users v ON pc.verified_by = v.user_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.student_id) {
      query += " AND pc.student_id = ?";
      params.push(filters.student_id);
    }
    if (filters.invoice_id) {
      query += " AND pc.invoice_id = ?";
      params.push(filters.invoice_id);
    }
    if (filters.payment_method) {
      query += " AND pc.payment_method = ?";
      params.push(filters.payment_method);
    }
    if (filters.payment_status) {
      query += " AND pc.payment_status = ?";
      params.push(filters.payment_status);
    }
    if (filters.start_date && filters.end_date) {
      query += " AND pc.payment_date BETWEEN ? AND ?";
      params.push(filters.start_date, filters.end_date);
    }
    if (filters.search) {
      query += ` AND (pc.payment_reference LIKE ? OR 
                      pc.receipt_number LIKE ? OR
                      CONCAT(s.first_name, ' ', s.last_name) LIKE ? OR 
                      sd.student_number LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY pc.created_at DESC";

    if (filters.limit) {
      query += " LIMIT ? OFFSET ?";
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    db.query(query, params, callback);
  },

  // Get payment by ID
  getById: (id, callback) => {
    const query = `
      SELECT 
        pc.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.email as student_email,
        sd.student_number,
        si.invoice_number,
        si.total_amount as invoice_total,
        si.amount_paid as invoice_paid,
        si.balance as invoice_balance,
        CONCAT(c.first_name, ' ', c.last_name) as collected_by_name,
        CONCAT(v.first_name, ' ', v.last_name) as verified_by_name
      FROM payment_collections pc
      INNER JOIN users s ON pc.student_id = s.user_id
      LEFT JOIN student_details sd ON s.user_id = sd.user_id
      INNER JOIN student_invoices si ON pc.invoice_id = si.invoice_id
      LEFT JOIN users c ON pc.collected_by = c.user_id
      LEFT JOIN users v ON pc.verified_by = v.user_id
      WHERE pc.payment_id = ?
    `;
    db.query(query, [id], callback);
  },

  // Get payments by student
  getByStudent: (student_id, callback) => {
    const query = `
      SELECT 
        pc.*,
        si.invoice_number
      FROM payment_collections pc
      INNER JOIN student_invoices si ON pc.invoice_id = si.invoice_id
      WHERE pc.student_id = ?
      ORDER BY pc.payment_date DESC
    `;
    db.query(query, [student_id], callback);
  },

  // Get payments by invoice
  getByInvoice: (invoice_id, callback) => {
    const query = `
      SELECT 
        pc.*,
        CONCAT(c.first_name, ' ', c.last_name) as collected_by_name
      FROM payment_collections pc
      LEFT JOIN users c ON pc.collected_by = c.user_id
      WHERE pc.invoice_id = ?
      ORDER BY pc.payment_date DESC
    `;
    db.query(query, [invoice_id], callback);
  },

  // Update payment
  update: (id, data, callback) => {
    const query = `
      UPDATE payment_collections 
      SET amount_paid = ?, payment_method = ?, payment_date = ?,
          bank_name = ?, check_number = ?, reference_number = ?,
          payment_status = ?, receipt_number = ?, notes = ?
      WHERE payment_id = ?
    `;
    db.query(
      query,
      [
        data.amount_paid,
        data.payment_method,
        data.payment_date,
        data.bank_name,
        data.check_number,
        data.reference_number,
        data.payment_status,
        data.receipt_number,
        data.notes,
        id,
      ],
      callback
    );
  },

  // Verify payment
  verify: (id, verified_by, callback) => {
    const query = `
      UPDATE payment_collections 
      SET payment_status = 'Verified', verified_by = ?
      WHERE payment_id = ?
    `;
    db.query(query, [verified_by, id], callback);
  },

  // Update payment status
  updateStatus: (id, status, callback) => {
    const query =
      "UPDATE payment_collections SET payment_status = ? WHERE payment_id = ?";
    db.query(query, [status, id], callback);
  },

  // Delete payment
  delete: (id, callback) => {
    const query = "DELETE FROM payment_collections WHERE payment_id = ?";
    db.query(query, [id], callback);
  },

  // Generate payment reference
  generatePaymentReference: (callback) => {
    const query = `
      SELECT payment_reference FROM payment_collections 
      ORDER BY payment_id DESC LIMIT 1
    `;
    db.query(query, [], callback);
  },

  // Get payment summary
  getPaymentSummary: (filters, callback) => {
    let query = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount_paid) as total_collected,
        SUM(CASE WHEN payment_status = 'Verified' THEN amount_paid ELSE 0 END) as verified_amount,
        SUM(CASE WHEN payment_status = 'Pending' THEN amount_paid ELSE 0 END) as pending_amount,
        COUNT(DISTINCT student_id) as unique_payers
      FROM payment_collections
      WHERE 1=1
    `;
    const params = [];

    if (filters.start_date && filters.end_date) {
      query += " AND payment_date BETWEEN ? AND ?";
      params.push(filters.start_date, filters.end_date);
    }
    if (filters.payment_method) {
      query += " AND payment_method = ?";
      params.push(filters.payment_method);
    }

    db.query(query, params, callback);
  },

  // Get daily collection report
  getDailyCollection: (date, callback) => {
    const query = `
      SELECT 
        payment_method,
        COUNT(*) as transaction_count,
        SUM(amount_paid) as total_amount
      FROM payment_collections
      WHERE DATE(payment_date) = ?
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `;
    db.query(query, [date], callback);
  },
};

export default Payment;
