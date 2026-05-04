import GradeEntriesModel from "../model/gradeEntries.model.js";

const GradeEntriesService = {
  getAllEntries: async (filters) => {
    try {
      const entries = await GradeEntriesModel.getAll(filters);
      return { success: true, data: entries };
    } catch (error) {
      console.error("Error in getAllEntries service:", error);
      throw error;
    }
  },

  getEntryById: async (entryId) => {
    try {
      const entry = await GradeEntriesModel.getById(entryId);
      if (!entry) {
        return { success: false, message: "Grade entry not found" };
      }
      return { success: true, data: entry };
    } catch (error) {
      console.error("Error in getEntryById service:", error);
      throw error;
    }
  },

  createEntry: async (entryData) => {
    try {
      // Calculate percentage if raw_score and max_score are provided
      if (entryData.raw_score && entryData.max_score) {
        entryData.percentage =
          (entryData.raw_score / entryData.max_score) * 100;
      }

      // Calculate weighted score if percentage and weight are provided
      if (entryData.percentage && entryData.weight) {
        entryData.weighted_score =
          (entryData.percentage * entryData.weight) / 100;
      }

      const entryId = await GradeEntriesModel.create(entryData);
      return {
        success: true,
        entryId,
        message: "Grade entry created successfully",
      };
    } catch (error) {
      console.error("Error in createEntry service:", error);
      throw error;
    }
  },

  updateEntry: async (entryId, entryData) => {
    try {
      // Recalculate percentage and weighted score
      if (entryData.raw_score && entryData.max_score) {
        entryData.percentage =
          (entryData.raw_score / entryData.max_score) * 100;
      }

      if (entryData.percentage && entryData.weight) {
        entryData.weighted_score =
          (entryData.percentage * entryData.weight) / 100;
      }

      const affectedRows = await GradeEntriesModel.update(entryId, entryData);
      if (affectedRows === 0) {
        return {
          success: false,
          message: "Grade entry not found or no changes made",
        };
      }
      return { success: true, message: "Grade entry updated successfully" };
    } catch (error) {
      console.error("Error in updateEntry service:", error);
      throw error;
    }
  },

  deleteEntry: async (entryId) => {
    try {
      const affectedRows = await GradeEntriesModel.delete(entryId);
      if (affectedRows === 0) {
        return { success: false, message: "Grade entry not found" };
      }
      return { success: true, message: "Grade entry deleted successfully" };
    } catch (error) {
      console.error("Error in deleteEntry service:", error);
      throw error;
    }
  },

  approveEntry: async (entryId, approvedBy) => {
    try {
      const affectedRows = await GradeEntriesModel.approve(entryId, approvedBy);
      if (affectedRows === 0) {
        return { success: false, message: "Grade entry not found" };
      }
      return { success: true, message: "Grade entry approved successfully" };
    } catch (error) {
      console.error("Error in approveEntry service:", error);
      throw error;
    }
  },

  rejectEntry: async (entryId, approvedBy, rejectionReason) => {
    try {
      const affectedRows = await GradeEntriesModel.reject(
        entryId,
        approvedBy,
        rejectionReason
      );
      if (affectedRows === 0) {
        return { success: false, message: "Grade entry not found" };
      }
      return { success: true, message: "Grade entry rejected successfully" };
    } catch (error) {
      console.error("Error in rejectEntry service:", error);
      throw error;
    }
  },

  getPendingCount: async () => {
    try {
      const count = await GradeEntriesModel.getPendingCount();
      return { success: true, count };
    } catch (error) {
      console.error("Error in getPendingCount service:", error);
      throw error;
    }
  },

  syncFromSubmissions: async (courseId, periodId, submittedBy) => {
    try {
      const pool = await import("../config/db.js");
      const db = pool.default;

      // Query to get all graded submissions for this course and period
      const submissionsQuery = `
        SELECT 
          las.id as submission_id,
          las.student_id,
          la.id as assignment_id,
          las.score,
          la.title as assignment_name,
          la.assignment_type as assignment_type,
          COALESCE(la.total_points, 100) as max_score,
          e.enrollment_id
        FROM lms_assignment_submissions las
        INNER JOIN lms_assignments la ON las.assignment_id = la.id
        INNER JOIN enrollments e ON las.student_id = e.student_id AND la.course_id = e.course_id
        WHERE la.course_id = ? 
          AND e.period_id = ?
          AND las.score IS NOT NULL
          AND las.status IN ('graded', 'submitted')
          AND las.graded_at IS NOT NULL
        ORDER BY las.student_id, la.title
      `;

      const [submissions] = await db.query(submissionsQuery, [courseId, periodId]);

      if (!submissions || submissions.length === 0) {
        return {
          success: true,
          message: "No graded submissions found",
          synced: 0,
        };
      }

      let syncedCount = 0;

      for (const submission of submissions) {
        // Extract order number from assignment name (e.g., "Assignment 1" -> 1)
        const nameMatch = submission.assignment_name.match(/(\d+)/);
        const orderNumber = nameMatch ? Number(nameMatch[1]) : 0;

        // Determine component type based on assignment type
        let componentType = "assignment";
        if (submission.assignment_type && submission.assignment_type.toLowerCase() === "quiz") {
          componentType = "quiz";
        } else if (submission.assignment_type && submission.assignment_type.toLowerCase() === "exam") {
          componentType = "exam";
        }

        // Check if grade_entry already exists
        const checkQuery = `
          SELECT entry_id FROM grade_entries 
          WHERE student_id = ? 
            AND course_id = ? 
            AND period_id = ?
            AND component_type = ?
            AND component_name = ?
        `;

        const [existing] = await db.query(checkQuery, [
          submission.student_id,
          courseId,
          periodId,
          componentType,
          submission.assignment_name,
        ]);

        // Calculate percentage
        const maxScore = submission.max_score || 100;
        const percentage = (submission.score / maxScore) * 100;

        if (existing.length > 0) {
          // Update existing entry
          const updateQuery = `
            UPDATE grade_entries 
            SET raw_score = ?, percentage = ?, submitted_at = NOW()
            WHERE entry_id = ?
          `;

          await db.query(updateQuery, [
            submission.score,
            percentage,
            existing[0].entry_id,
          ]);
        } else {
          // Create new entry
          const insertQuery = `
            INSERT INTO grade_entries (
              student_id, course_id, period_id, component_name, 
              component_type, raw_score, max_score, percentage, submitted_by, submitted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `;

          await db.query(insertQuery, [
            submission.student_id,
            courseId,
            periodId,
            submission.assignment_name,
            componentType,
            submission.score,
            maxScore,
            percentage,
            submittedBy,
          ]);
        }

        syncedCount++;
      }

      return {
        success: true,
        message: `Synced ${syncedCount} graded submissions to grade entries`,
        synced: syncedCount,
      };
    } catch (error) {
      console.error("Error in syncFromSubmissions service:", error);
      throw error;
    }
  },
};

export default GradeEntriesService;
