import db from "../config/db.js";

const IncomeExpense = {
  // Create new transaction
  create: (data, callback) => {
    const query = `
      INSERT INTO income_expenses 
      (transaction_type, transaction_number, category, subcategory, amount,
       transaction_date, description, payment_method, reference_number,
       vendor_payee, department, academic_period_id, status, receipt_url,
       supporting_docs, requested_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      query,
      [
        data.transaction_type,
        data.transaction_number,
        data.category,
        data.subcategory,
        data.amount,
        data.transaction_date,
        data.description,
        data.payment_method,
        data.reference_number,
        data.vendor_payee,
        data.department,
        data.academic_period_id,
        data.status || "Pending",
        data.receipt_url,
        data.supporting_docs,
        data.requested_by,
      ],
      callback
    );
  },

  // Get all transactions
  getAll: (filters, callback) => {
    let query = `
      SELECT 
        ie.*,
        ap.school_year,
        ap.semester,
        CONCAT(r.first_name, ' ', r.last_name) as requested_by_name,
        CONCAT(a.first_name, ' ', a.last_name) as approved_by_name,
        CONCAT(p.first_name, ' ', p.last_name) as processed_by_name
      FROM income_expenses ie
      LEFT JOIN academic_periods ap ON ie.academic_period_id = ap.period_id
      LEFT JOIN users r ON ie.requested_by = r.user_id
      LEFT JOIN users a ON ie.approved_by = a.user_id
      LEFT JOIN users p ON ie.processed_by = p.user_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.transaction_type) {
      query += " AND ie.transaction_type = ?";
      params.push(filters.transaction_type);
    }
    if (filters.category) {
      query += " AND ie.category = ?";
      params.push(filters.category);
    }
    if (filters.status) {
      query += " AND ie.status = ?";
      params.push(filters.status);
    }
    if (filters.department) {
      query += " AND ie.department = ?";
      params.push(filters.department);
    }
    if (filters.academic_period_id) {
      query += " AND ie.academic_period_id = ?";
      params.push(filters.academic_period_id);
    }
    if (filters.start_date && filters.end_date) {
      query += " AND ie.transaction_date BETWEEN ? AND ?";
      params.push(filters.start_date, filters.end_date);
    }
    if (filters.search) {
      query += ` AND (ie.transaction_number LIKE ? OR 
                      ie.category LIKE ? OR 
                      ie.vendor_payee LIKE ? OR 
                      ie.description LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY ie.transaction_date DESC, ie.created_at DESC";

    if (filters.limit) {
      query += " LIMIT ? OFFSET ?";
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    db.query(query, params, callback);
  },

  // Get transaction by ID
  getById: (id, callback) => {
    const query = `
      SELECT 
        ie.*,
        ap.school_year,
        ap.semester,
        CONCAT(r.first_name, ' ', r.last_name) as requested_by_name,
        CONCAT(a.first_name, ' ', a.last_name) as approved_by_name,
        CONCAT(p.first_name, ' ', p.last_name) as processed_by_name
      FROM income_expenses ie
      LEFT JOIN academic_periods ap ON ie.academic_period_id = ap.period_id
      LEFT JOIN users r ON ie.requested_by = r.user_id
      LEFT JOIN users a ON ie.approved_by = a.user_id
      LEFT JOIN users p ON ie.processed_by = p.user_id
      WHERE ie.transaction_id = ?
    `;
    db.query(query, [id], callback);
  },

  // Update transaction
  update: (id, data, callback) => {
    const query = `
      UPDATE income_expenses 
      SET transaction_type = ?, category = ?, subcategory = ?, amount = ?,
          transaction_date = ?, description = ?, payment_method = ?,
          reference_number = ?, vendor_payee = ?, department = ?,
          academic_period_id = ?, status = ?, receipt_url = ?,
          supporting_docs = ?
      WHERE transaction_id = ?
    `;
    db.query(
      query,
      [
        data.transaction_type,
        data.category,
        data.subcategory,
        data.amount,
        data.transaction_date,
        data.description,
        data.payment_method,
        data.reference_number,
        data.vendor_payee,
        data.department,
        data.academic_period_id,
        data.status,
        data.receipt_url,
        data.supporting_docs,
        id,
      ],
      callback
    );
  },

  // Approve transaction
  approve: (id, approved_by, callback) => {
    const query = `
      UPDATE income_expenses 
      SET status = 'Approved', approved_by = ?
      WHERE transaction_id = ?
    `;
    db.query(query, [approved_by, id], callback);
  },

  // Process transaction (mark as paid)
  process: (id, processed_by, callback) => {
    const query = `
      UPDATE income_expenses 
      SET status = 'Paid', processed_by = ?
      WHERE transaction_id = ?
    `;
    db.query(query, [processed_by, id], callback);
  },

  // Update status
  updateStatus: (id, status, callback) => {
    const query =
      "UPDATE income_expenses SET status = ? WHERE transaction_id = ?";
    db.query(query, [status, id], callback);
  },

  // Delete transaction
  delete: (id, callback) => {
    const query = "DELETE FROM income_expenses WHERE transaction_id = ?";
    db.query(query, [id], callback);
  },

  // Generate transaction number
  generateTransactionNumber: (type, callback) => {
    const query = `
      SELECT transaction_number FROM income_expenses 
      WHERE transaction_type = ?
      ORDER BY transaction_id DESC LIMIT 1
    `;
    db.query(query, [type], callback);
  },

  // Get financial summary
  getFinancialSummary: (filters, callback) => {
    let query = `
      SELECT 
        SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END) as total_expenses,
        SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END) - 
        SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END) as net_income,
        COUNT(CASE WHEN transaction_type = 'Income' THEN 1 END) as income_count,
        COUNT(CASE WHEN transaction_type = 'Expense' THEN 1 END) as expense_count
      FROM income_expenses
      WHERE status IN ('Approved', 'Paid')
    `;
    const params = [];

    if (filters.start_date && filters.end_date) {
      query += " AND transaction_date BETWEEN ? AND ?";
      params.push(filters.start_date, filters.end_date);
    }
    if (filters.academic_period_id) {
      query += " AND academic_period_id = ?";
      params.push(filters.academic_period_id);
    }

    db.query(query, params, callback);
  },

  // Get category breakdown
  getCategoryBreakdown: (transaction_type, filters, callback) => {
    let query = `
      SELECT 
        category,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
      FROM income_expenses
      WHERE transaction_type = ? AND status IN ('Approved', 'Paid')
    `;
    const params = [transaction_type];

    if (filters.start_date && filters.end_date) {
      query += " AND transaction_date BETWEEN ? AND ?";
      params.push(filters.start_date, filters.end_date);
    }
    if (filters.academic_period_id) {
      query += " AND academic_period_id = ?";
      params.push(filters.academic_period_id);
    }

    query += " GROUP BY category ORDER BY total_amount DESC";
    db.query(query, params, callback);
  },

  // Get monthly trend
  getMonthlyTrend: (year, callback) => {
    const query = `
      SELECT 
        MONTH(transaction_date) as month,
        SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END) as expenses
      FROM income_expenses
      WHERE YEAR(transaction_date) = ? AND status IN ('Approved', 'Paid')
      GROUP BY MONTH(transaction_date)
      ORDER BY month
    `;
    db.query(query, [year], callback);
  },

  // Get department expenses
  getDepartmentExpenses: (filters, callback) => {
    let query = `
      SELECT 
        department,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
      FROM income_expenses
      WHERE transaction_type = 'Expense' AND status IN ('Approved', 'Paid')
    `;
    const params = [];

    if (filters.start_date && filters.end_date) {
      query += " AND transaction_date BETWEEN ? AND ?";
      params.push(filters.start_date, filters.end_date);
    }

    query += " GROUP BY department ORDER BY total_amount DESC";
    db.query(query, params, callback);
  },
};

export default IncomeExpense;
