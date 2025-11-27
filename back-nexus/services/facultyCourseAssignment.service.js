import FacultyCourseAssignment from "../model/facultyCourseAssignment.model.js";

const FacultyCourseAssignmentService = {
  // Get all course assignments
  async getAllAssignments() {
    try {
      const [assignments] = await FacultyCourseAssignment.getAll();
      return { success: true, data: assignments };
    } catch (error) {
      console.error("Error getting all assignments:", error);
      return {
        success: false,
        message: "Failed to retrieve course assignments",
      };
    }
  },

  // Get assignments by faculty ID
  async getAssignmentsByFacultyId(facultyUserId) {
    try {
      const [assignments] = await FacultyCourseAssignment.getByFacultyId(
        facultyUserId
      );
      return { success: true, data: assignments };
    } catch (error) {
      console.error("Error getting assignments by faculty:", error);
      return { success: false, message: "Failed to retrieve assignments" };
    }
  },

  // Get assignments by academic period
  async getAssignmentsByAcademicPeriod(periodId) {
    try {
      const [assignments] = await FacultyCourseAssignment.getByAcademicPeriod(
        periodId
      );
      return { success: true, data: assignments };
    } catch (error) {
      console.error("Error getting assignments by period:", error);
      return { success: false, message: "Failed to retrieve assignments" };
    }
  },

  // Get assignment by ID
  async getAssignmentById(assignmentId) {
    try {
      const [assignment] = await FacultyCourseAssignment.getById(assignmentId);
      if (assignment.length === 0) {
        return { success: false, message: "Assignment not found" };
      }
      return { success: true, data: assignment[0] };
    } catch (error) {
      console.error("Error getting assignment by ID:", error);
      return { success: false, message: "Failed to retrieve assignment" };
    }
  },

  // Create new course assignment
  async createAssignment(assignmentData) {
    try {
      // Check for schedule conflicts
      const [conflicts] = await FacultyCourseAssignment.checkConflict(
        assignmentData.faculty_user_id,
        assignmentData.academic_period_id,
        assignmentData.schedule_day,
        assignmentData.schedule_time_start,
        assignmentData.schedule_time_end
      );

      if (conflicts.length > 0) {
        return {
          success: false,
          message:
            "Schedule conflict detected. Faculty already has a class at this time.",
        };
      }

      const [result] = await FacultyCourseAssignment.create(assignmentData);
      return {
        success: true,
        message: "Course assignment created successfully",
        data: { assignment_id: result.insertId },
      };
    } catch (error) {
      console.error("Error creating assignment:", error);
      return { success: false, message: "Failed to create course assignment" };
    }
  },

  // Update course assignment
  async updateAssignment(assignmentId, assignmentData) {
    try {
      // Check for schedule conflicts (excluding current assignment)
      const [conflicts] = await FacultyCourseAssignment.checkConflict(
        assignmentData.faculty_user_id,
        assignmentData.academic_period_id,
        assignmentData.schedule_day,
        assignmentData.schedule_time_start,
        assignmentData.schedule_time_end,
        assignmentId
      );

      if (conflicts.length > 0) {
        return {
          success: false,
          message:
            "Schedule conflict detected. Faculty already has a class at this time.",
        };
      }

      const [result] = await FacultyCourseAssignment.update(
        assignmentId,
        assignmentData
      );
      if (result.affectedRows === 0) {
        return { success: false, message: "Assignment not found" };
      }
      return {
        success: true,
        message: "Course assignment updated successfully",
      };
    } catch (error) {
      console.error("Error updating assignment:", error);
      return { success: false, message: "Failed to update course assignment" };
    }
  },

  // Delete course assignment
  async deleteAssignment(assignmentId) {
    try {
      const [result] = await FacultyCourseAssignment.delete(assignmentId);
      if (result.affectedRows === 0) {
        return { success: false, message: "Assignment not found" };
      }
      return {
        success: true,
        message: "Course assignment deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting assignment:", error);
      return { success: false, message: "Failed to delete course assignment" };
    }
  },
};

export default FacultyCourseAssignmentService;
