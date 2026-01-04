import Payment from "../model/payments.model.js";
import Invoice from "../model/invoices.model.js";

const paymentController = {
  // Create new payment
  createPayment: (req, res) => {
    // Generate payment reference
    Payment.generatePaymentReference((err, results) => {
      if (err) {
        console.error("Error generating payment reference:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to generate payment reference",
          error: err.message,
        });
      }

      let paymentRef = "PAY-000001";
      if (results.length > 0 && results[0].payment_reference) {
        const lastNumber = parseInt(results[0].payment_reference.split("-")[1]);
        paymentRef = `PAY-${String(lastNumber + 1).padStart(6, "0")}`;
      }

      const data = {
        payment_reference: paymentRef,
        ...req.body,
        collected_by: req.user.user_id,
      };

      Payment.create(data, (err, result) => {
        if (err) {
          console.error("Error creating payment:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to create payment",
            error: err.message,
          });
        }

        // Update invoice payment amount
        Invoice.updatePayment(
          data.invoice_id,
          data.amount_paid,
          (err2, result2) => {
            if (err2) {
              console.error("Error updating invoice payment:", err2);
            }

            // Check if invoice is fully paid and update status
            Invoice.getById(data.invoice_id, (err3, invoiceResults) => {
              if (!err3 && invoiceResults.length > 0) {
                const invoice = invoiceResults[0];
                let newStatus = "Partially Paid";
                if (invoice.balance <= 0) {
                  newStatus = "Paid";
                }
                Invoice.updateStatus(data.invoice_id, newStatus, () => {});
              }
            });
          }
        );

        res.status(201).json({
          success: true,
          message: "Payment recorded successfully",
          data: {
            payment_id: result.insertId,
            payment_reference: paymentRef,
          },
        });
      });
    });
  },

  // Get all payments
  getAllPayments: (req, res) => {
    const filters = {
      student_id: req.query.student_id,
      invoice_id: req.query.invoice_id,
      payment_method: req.query.payment_method,
      payment_status: req.query.payment_status,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      search: req.query.search,
      limit: req.query.limit || 50,
      offset: req.query.offset || 0,
    };

    Payment.getAll(filters, (err, results) => {
      if (err) {
        console.error("Error fetching payments:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch payments",
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

  // Get payment by ID
  getPaymentById: (req, res) => {
    const { id } = req.params;

    Payment.getById(id, (err, results) => {
      if (err) {
        console.error("Error fetching payment:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch payment",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      res.status(200).json({
        success: true,
        data: results[0],
      });
    });
  },

  // Get payments by student
  getPaymentsByStudent: (req, res) => {
    const { student_id } = req.params;

    Payment.getByStudent(student_id, (err, results) => {
      if (err) {
        console.error("Error fetching student payments:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch student payments",
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

  // Get payments by invoice
  getPaymentsByInvoice: (req, res) => {
    const { invoice_id } = req.params;

    Payment.getByInvoice(invoice_id, (err, results) => {
      if (err) {
        console.error("Error fetching invoice payments:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch invoice payments",
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

  // Update payment
  updatePayment: (req, res) => {
    const { id } = req.params;
    const data = req.body;

    Payment.update(id, data, (err, result) => {
      if (err) {
        console.error("Error updating payment:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update payment",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Payment updated successfully",
      });
    });
  },

  // Verify payment
  verifyPayment: (req, res) => {
    const { id } = req.params;
    const verified_by = req.user.user_id;

    Payment.verify(id, verified_by, (err, result) => {
      if (err) {
        console.error("Error verifying payment:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to verify payment",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    });
  },

  // Delete payment
  deletePayment: (req, res) => {
    const { id } = req.params;

    // First get the payment details to update the invoice
    Payment.getById(id, (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      const payment = results[0];

      Payment.delete(id, (err, result) => {
        if (err) {
          console.error("Error deleting payment:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to delete payment",
            error: err.message,
          });
        }

        // Update invoice payment amount (subtract deleted payment)
        Invoice.updatePayment(
          payment.invoice_id,
          -payment.amount_paid,
          () => {}
        );

        res.status(200).json({
          success: true,
          message: "Payment deleted successfully",
        });
      });
    });
  },

  // Get payment summary
  getPaymentSummary: (req, res) => {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      payment_method: req.query.payment_method,
    };

    Payment.getPaymentSummary(filters, (err, results) => {
      if (err) {
        console.error("Error fetching payment summary:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch payment summary",
          error: err.message,
        });
      }

      res.status(200).json({
        success: true,
        data: results[0] || {},
      });
    });
  },

  // Get daily collection report
  getDailyCollection: (req, res) => {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    Payment.getDailyCollection(date, (err, results) => {
      if (err) {
        console.error("Error fetching daily collection:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch daily collection",
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

export default paymentController;
