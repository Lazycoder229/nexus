import Scholarship from "../model/scholarships.model.js";

const scholarshipController = {
  // ========== SCHOLARSHIP PROGRAMS ==========

  // Create scholarship program
  createProgram: (req, res) => {
    const data = {
      ...req.body,
      created_by: req.user.user_id,
    };

    Scholarship.createProgram(data, (err, result) => {
      if (err) {
        console.error("Error creating scholarship program:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create scholarship program",
          error: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Scholarship program created successfully",
        data: { scholarship_id: result.insertId },
      });
    });
  },

  // Get all scholarship programs
  getAllPrograms: (req, res) => {
    const filters = {
      scholarship_type: req.query.scholarship_type,
      academic_period_id: req.query.academic_period_id,
      is_active: req.query.is_active,
      search: req.query.search,
    };

    Scholarship.getAllPrograms(filters, (err, results) => {
      if (err) {
        console.error("Error fetching scholarship programs:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch scholarship programs",
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

  // Get scholarship program by ID
  getProgramById: (req, res) => {
    const { id } = req.params;

    Scholarship.getProgramById(id, (err, results) => {
      if (err) {
        console.error("Error fetching scholarship program:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch scholarship program",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Scholarship program not found",
        });
      }

      res.status(200).json({
        success: true,
        data: results[0],
      });
    });
  },

  // Update scholarship program
  updateProgram: (req, res) => {
    const { id } = req.params;
    const data = req.body;

    Scholarship.updateProgram(id, data, (err, result) => {
      if (err) {
        console.error("Error updating scholarship program:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update scholarship program",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Scholarship program not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Scholarship program updated successfully",
      });
    });
  },

  // Delete scholarship program
  deleteProgram: (req, res) => {
    const { id } = req.params;

    Scholarship.deleteProgram(id, (err, result) => {
      if (err) {
        console.error("Error deleting scholarship program:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to delete scholarship program",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Scholarship program not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Scholarship program deleted successfully",
      });
    });
  },

  // ========== SCHOLARSHIP ALLOCATIONS ==========

  // Create scholarship allocation
  createAllocation: (req, res) => {
    const data = {
      ...req.body,
      created_by: req.user.user_id,
    };

    Scholarship.createAllocation(data, (err, result) => {
      if (err) {
        console.error("Error creating scholarship allocation:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create scholarship allocation",
          error: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Scholarship allocation created successfully",
        data: { allocation_id: result.insertId },
      });
    });
  },

  // Get all scholarship allocations
  getAllAllocations: (req, res) => {
    const filters = {
      scholarship_id: req.query.scholarship_id,
      student_id: req.query.student_id,
      academic_period_id: req.query.academic_period_id,
      status: req.query.status,
      search: req.query.search,
      limit: req.query.limit || 50,
      offset: req.query.offset || 0,
    };

    Scholarship.getAllAllocations(filters, (err, results) => {
      if (err) {
        console.error("Error fetching scholarship allocations:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch scholarship allocations",
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

  // Get allocation by ID
  getAllocationById: (req, res) => {
    const { id } = req.params;

    Scholarship.getAllocationById(id, (err, results) => {
      if (err) {
        console.error("Error fetching scholarship allocation:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch scholarship allocation",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Scholarship allocation not found",
        });
      }

      res.status(200).json({
        success: true,
        data: results[0],
      });
    });
  },

  // Update scholarship allocation
  updateAllocation: (req, res) => {
    const { id } = req.params;
    const data = req.body;

    Scholarship.updateAllocation(id, data, (err, result) => {
      if (err) {
        console.error("Error updating scholarship allocation:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update scholarship allocation",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Scholarship allocation not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Scholarship allocation updated successfully",
      });
    });
  },

  // Approve scholarship allocation
  approveAllocation: (req, res) => {
    const { id } = req.params;
    const { approval_notes } = req.body;
    const approved_by = req.user.user_id;

    Scholarship.approveAllocation(
      id,
      approved_by,
      approval_notes,
      (err, result) => {
        if (err) {
          console.error("Error approving scholarship allocation:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to approve scholarship allocation",
            error: err.message,
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Scholarship allocation not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Scholarship allocation approved successfully",
        });
      }
    );
  },

  // Delete scholarship allocation
  deleteAllocation: (req, res) => {
    const { id } = req.params;

    Scholarship.deleteAllocation(id, (err, result) => {
      if (err) {
        console.error("Error deleting scholarship allocation:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to delete scholarship allocation",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Scholarship allocation not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Scholarship allocation deleted successfully",
      });
    });
  },

  // Get scholarship summary
  getScholarshipSummary: (req, res) => {
    const filters = {
      academic_period_id: req.query.academic_period_id,
    };

    Scholarship.getScholarshipSummary(filters, (err, results) => {
      if (err) {
        console.error("Error fetching scholarship summary:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch scholarship summary",
          error: err.message,
        });
      }

      res.status(200).json({
        success: true,
        data: results[0] || {},
      });
    });
  },

  // Get student scholarships
  getStudentScholarships: (req, res) => {
    const { student_id } = req.params;

    Scholarship.getStudentScholarships(student_id, (err, results) => {
      if (err) {
        console.error("Error fetching student scholarships:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch student scholarships",
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

export default scholarshipController;
