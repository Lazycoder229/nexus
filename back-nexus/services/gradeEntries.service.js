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
};

export default GradeEntriesService;
