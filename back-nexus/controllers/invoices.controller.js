import Invoice from "../model/invoices.model.js";

const invoiceController = {
  // Create new invoice
  createInvoice: (req, res) => {
    // Generate invoice number
    Invoice.generateInvoiceNumber((err, results) => {
      if (err) {
        console.error("Error generating invoice number:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to generate invoice number",
          error: err.message,
        });
      }

      let invoiceNumber = "INV-000001";
      if (results.length > 0 && results[0].invoice_number) {
        const lastNumber = parseInt(results[0].invoice_number.split("-")[1]);
        invoiceNumber = `INV-${String(lastNumber + 1).padStart(6, "0")}`;
      }

      const data = {
        invoice_number: invoiceNumber,
        ...req.body,
        created_by: req.user.user_id,
      };

      Invoice.create(data, (err, result) => {
        if (err) {
          console.error("Error creating invoice:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to create invoice",
            error: err.message,
          });
        }

        res.status(201).json({
          success: true,
          message: "Invoice created successfully",
          data: {
            invoice_id: result.insertId,
            invoice_number: invoiceNumber,
          },
        });
      });
    });
  },

  // Get all invoices
  getAllInvoices: (req, res) => {
    const filters = {
      student_id: req.query.student_id,
      academic_period_id: req.query.academic_period_id,
      status: req.query.status,
      search: req.query.search,
      limit: req.query.limit || 50,
      offset: req.query.offset || 0,
    };

    Invoice.getAll(filters, (err, results) => {
      if (err) {
        console.error("Error fetching invoices:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch invoices",
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

  // Get invoice by ID
  getInvoiceById: (req, res) => {
    const { id } = req.params;

    Invoice.getById(id, (err, results) => {
      if (err) {
        console.error("Error fetching invoice:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch invoice",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      res.status(200).json({
        success: true,
        data: results[0],
      });
    });
  },

  // Get invoices by student
  getInvoicesByStudent: (req, res) => {
    const { student_id } = req.params;

    Invoice.getByStudent(student_id, (err, results) => {
      if (err) {
        console.error("Error fetching student invoices:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch student invoices",
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

  // Update invoice
  updateInvoice: (req, res) => {
    const { id } = req.params;
    const data = req.body;

    Invoice.update(id, data, (err, result) => {
      if (err) {
        console.error("Error updating invoice:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update invoice",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Invoice updated successfully",
      });
    });
  },

  // Update invoice status
  updateInvoiceStatus: (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    Invoice.updateStatus(id, status, (err, result) => {
      if (err) {
        console.error("Error updating invoice status:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update invoice status",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Invoice status updated successfully",
      });
    });
  },

  // Delete invoice
  deleteInvoice: (req, res) => {
    const { id } = req.params;

    Invoice.delete(id, (err, result) => {
      if (err) {
        console.error("Error deleting invoice:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to delete invoice",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Invoice deleted successfully",
      });
    });
  },

  // Get financial summary
  getFinancialSummary: (req, res) => {
    const filters = {
      academic_period_id: req.query.academic_period_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    Invoice.getFinancialSummary(filters, (err, results) => {
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
};

export default invoiceController;
