import StaffLeave from "../model/staffLeave.model.js";

// Get all leave requests
export const getAllLeaveRequests = (req, res) => {
  const filters = {
    employee_id: req.query.employee_id,
    status: req.query.status,
    leave_type: req.query.leave_type,
    start_date: req.query.start_date,
    end_date: req.query.end_date,
  };

  StaffLeave.getAll(filters, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching leave requests", error: err });
    }
    res.json({ success: true, data: results });
  });
};

// Get leave request by ID
export const getLeaveById = (req, res) => {
  StaffLeave.getById(req.params.id, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching leave request", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    res.json({ success: true, data: results[0] });
  });
};

// Create leave request
export const createLeaveRequest = (req, res) => {
  StaffLeave.create(req.body, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error creating leave request", error: err });
    }
    res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      leave_id: result.insertId,
    });
  });
};

// Update leave request
export const updateLeaveRequest = (req, res) => {
  StaffLeave.update(req.params.id, req.body, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error updating leave request", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    res.json({ success: true, message: "Leave request updated successfully" });
  });
};

// Approve leave request
export const approveLeave = (req, res) => {
  const approvedBy = req.body.approved_by || req.user?.user_id;

  StaffLeave.approve(req.params.id, approvedBy, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error approving leave request", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    res.json({ success: true, message: "Leave request approved successfully" });
  });
};

// Reject leave request
export const rejectLeave = (req, res) => {
  const approvedBy = req.body.approved_by || req.user?.user_id;
  const rejectionReason = req.body.rejection_reason;

  StaffLeave.reject(
    req.params.id,
    approvedBy,
    rejectionReason,
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error rejecting leave request", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      res.json({
        success: true,
        message: "Leave request rejected successfully",
      });
    }
  );
};

// Delete leave request
export const deleteLeaveRequest = (req, res) => {
  StaffLeave.delete(req.params.id, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error deleting leave request", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    res.json({ success: true, message: "Leave request deleted successfully" });
  });
};

// Get leave summary
export const getLeaveSummary = (req, res) => {
  const filters = {
    start_date: req.query.start_date,
    end_date: req.query.end_date,
  };

  StaffLeave.getSummary(filters, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching summary", error: err });
    }
    res.json({ success: true, data: results[0] });
  });
};

export default {
  getAllLeaveRequests,
  getLeaveById,
  createLeaveRequest,
  updateLeaveRequest,
  approveLeave,
  rejectLeave,
  deleteLeaveRequest,
  getLeaveSummary,
};
