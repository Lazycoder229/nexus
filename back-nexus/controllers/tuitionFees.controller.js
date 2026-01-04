import TuitionFee from "../model/tuitionFees.model.js";

const tuitionFeeController = {
  // Create new tuition fee setup
  createTuitionFee: (req, res) => {
    const data = {
      ...req.body,
      created_by: req.user.user_id,
    };

    TuitionFee.create(data, (err, result) => {
      if (err) {
        console.error("Error creating tuition fee:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create tuition fee setup",
          error: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Tuition fee setup created successfully",
        data: { fee_setup_id: result.insertId },
      });
    });
  },

  // Get all tuition fees
  getAllTuitionFees: (req, res) => {
    const filters = {
      program_id: req.query.program_id,
      academic_period_id: req.query.academic_period_id,
      year_level: req.query.year_level,
      is_active: req.query.is_active,
    };

    TuitionFee.getAll(filters, (err, results) => {
      if (err) {
        console.error("Error fetching tuition fees:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch tuition fees",
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

  // Get tuition fee by ID
  getTuitionFeeById: (req, res) => {
    const { id } = req.params;

    TuitionFee.getById(id, (err, results) => {
      if (err) {
        console.error("Error fetching tuition fee:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch tuition fee",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tuition fee setup not found",
        });
      }

      res.status(200).json({
        success: true,
        data: results[0],
      });
    });
  },

  // Get fee for specific criteria
  getFeeByDetails: (req, res) => {
    const { program_id, year_level, academic_period_id } = req.query;

    if (!program_id || !year_level || !academic_period_id) {
      return res.status(400).json({
        success: false,
        message: "program_id, year_level, and academic_period_id are required",
      });
    }

    TuitionFee.getFeeByDetails(
      program_id,
      year_level,
      academic_period_id,
      (err, results) => {
        if (err) {
          console.error("Error fetching tuition fee:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch tuition fee",
            error: err.message,
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message:
              "No active tuition fee setup found for the specified criteria",
          });
        }

        res.status(200).json({
          success: true,
          data: results[0],
        });
      }
    );
  },

  // Update tuition fee
  updateTuitionFee: (req, res) => {
    const { id } = req.params;
    const data = req.body;

    TuitionFee.update(id, data, (err, result) => {
      if (err) {
        console.error("Error updating tuition fee:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update tuition fee",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Tuition fee setup not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Tuition fee setup updated successfully",
      });
    });
  },

  // Delete tuition fee
  deleteTuitionFee: (req, res) => {
    const { id } = req.params;

    TuitionFee.delete(id, (err, result) => {
      if (err) {
        console.error("Error deleting tuition fee:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to delete tuition fee",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Tuition fee setup not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Tuition fee setup deleted successfully",
      });
    });
  },
};

export default tuitionFeeController;
