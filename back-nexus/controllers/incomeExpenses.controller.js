import IncomeExpense from "../model/incomeExpenses.model.js";

const incomeExpenseController = {
  // Create new transaction
  createTransaction: (req, res) => {
    const transactionType = req.body.transaction_type;

    // Generate transaction number
    IncomeExpense.generateTransactionNumber(transactionType, (err, results) => {
      if (err) {
        console.error("Error generating transaction number:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to generate transaction number",
          error: err.message,
        });
      }

      const prefix = transactionType === "Income" ? "INC" : "EXP";
      let transactionNumber = `${prefix}-000001`;

      if (results.length > 0 && results[0].transaction_number) {
        const lastNumber = parseInt(
          results[0].transaction_number.split("-")[1]
        );
        transactionNumber = `${prefix}-${String(lastNumber + 1).padStart(
          6,
          "0"
        )}`;
      }

      const data = {
        transaction_number: transactionNumber,
        ...req.body,
        requested_by: req.user.user_id,
      };

      IncomeExpense.create(data, (err, result) => {
        if (err) {
          console.error("Error creating transaction:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to create transaction",
            error: err.message,
          });
        }

        res.status(201).json({
          success: true,
          message: "Transaction created successfully",
          data: {
            transaction_id: result.insertId,
            transaction_number: transactionNumber,
          },
        });
      });
    });
  },

  // Get all transactions
  getAllTransactions: (req, res) => {
    const filters = {
      transaction_type: req.query.transaction_type,
      category: req.query.category,
      status: req.query.status,
      department: req.query.department,
      academic_period_id: req.query.academic_period_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      search: req.query.search,
      limit: req.query.limit || 50,
      offset: req.query.offset || 0,
    };

    IncomeExpense.getAll(filters, (err, results) => {
      if (err) {
        console.error("Error fetching transactions:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch transactions",
          error: err.message,
        });
      }

      res.status(200).json({
        success: true,
        data: results,
        count: results.length,
      });
    });
  },

  // Get transaction by ID
  getTransactionById: (req, res) => {
    const { id } = req.params;

    IncomeExpense.getById(id, (err, results) => {
      if (err) {
        console.error("Error fetching transaction:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch transaction",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      res.status(200).json({
        success: true,
        data: results[0],
      });
    });
  },

  // Update transaction
  updateTransaction: (req, res) => {
    const { id } = req.params;
    const data = req.body;

    IncomeExpense.update(id, data, (err, result) => {
      if (err) {
        console.error("Error updating transaction:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update transaction",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Transaction updated successfully",
      });
    });
  },

  // Approve transaction
  approveTransaction: (req, res) => {
    const { id } = req.params;
    const approved_by = req.user.user_id;

    IncomeExpense.approve(id, approved_by, (err, result) => {
      if (err) {
        console.error("Error approving transaction:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to approve transaction",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Transaction approved successfully",
      });
    });
  },

  // Process transaction (mark as paid)
  processTransaction: (req, res) => {
    const { id } = req.params;
    const processed_by = req.user.user_id;

    IncomeExpense.process(id, processed_by, (err, result) => {
      if (err) {
        console.error("Error processing transaction:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to process transaction",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Transaction processed successfully",
      });
    });
  },

  // Delete transaction
  deleteTransaction: (req, res) => {
    const { id } = req.params;

    IncomeExpense.delete(id, (err, result) => {
      if (err) {
        console.error("Error deleting transaction:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to delete transaction",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Transaction deleted successfully",
      });
    });
  },

  // Get financial summary
  getFinancialSummary: (req, res) => {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      academic_period_id: req.query.academic_period_id,
    };

    IncomeExpense.getFinancialSummary(filters, (err, results) => {
      if (err) {
        console.error("Error fetching financial summary:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch financial summary",
          error: err.message,
        });
      }

      res.status(200).json({
        success: true,
        data: results[0] || {},
      });
    });
  },

  // Get category breakdown
  getCategoryBreakdown: (req, res) => {
    const { transaction_type } = req.params;
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      academic_period_id: req.query.academic_period_id,
    };

    IncomeExpense.getCategoryBreakdown(
      transaction_type,
      filters,
      (err, results) => {
        if (err) {
          console.error("Error fetching category breakdown:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch category breakdown",
            error: err.message,
          });
        }

        res.status(200).json({
          success: true,
          data: results,
          count: results.length,
        });
      }
    );
  },

  // Get monthly trend
  getMonthlyTrend: (req, res) => {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({
        success: false,
        message: "Year parameter is required",
      });
    }

    IncomeExpense.getMonthlyTrend(year, (err, results) => {
      if (err) {
        console.error("Error fetching monthly trend:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch monthly trend",
          error: err.message,
        });
      }

      res.status(200).json({
        success: true,
        data: results,
        count: results.length,
      });
    });
  },

  // Get department expenses
  getDepartmentExpenses: (req, res) => {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    IncomeExpense.getDepartmentExpenses(filters, (err, results) => {
      if (err) {
        console.error("Error fetching department expenses:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch department expenses",
          error: err.message,
        });
      }

      res.status(200).json({
        success: true,
        data: results,
        count: results.length,
      });
    });
  },
};

export default incomeExpenseController;
