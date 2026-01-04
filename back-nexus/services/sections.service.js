import SectionsModel from "../model/sections.model.js";

const SectionsService = {
  getAllSections: async (filters) => {
    try {
      return await SectionsModel.getAllSections(filters);
    } catch (error) {
      throw new Error(`Error fetching sections: ${error.message}`);
    }
  },

  getSectionById: async (id) => {
    try {
      const section = await SectionsModel.getSectionById(id);
      if (!section) {
        throw new Error("Section not found");
      }
      return section;
    } catch (error) {
      throw new Error(`Error fetching section: ${error.message}`);
    }
  },

  createSection: async (sectionData) => {
    try {
      // Validate required fields
      if (
        !sectionData.course_id ||
        !sectionData.period_id ||
        !sectionData.section_name
      ) {
        throw new Error("Missing required fields");
      }

      const sectionId = await SectionsModel.createSection(sectionData);
      return await SectionsModel.getSectionById(sectionId);
    } catch (error) {
      throw new Error(`Error creating section: ${error.message}`);
    }
  },

  updateSection: async (id, sectionData) => {
    try {
      const updated = await SectionsModel.updateSection(id, sectionData);
      if (!updated) {
        throw new Error("Section not found or not updated");
      }
      return await SectionsModel.getSectionById(id);
    } catch (error) {
      throw new Error(`Error updating section: ${error.message}`);
    }
  },

  deleteSection: async (id) => {
    try {
      const deleted = await SectionsModel.deleteSection(id);
      if (!deleted) {
        throw new Error("Section not found");
      }
      return { message: "Section deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting section: ${error.message}`);
    }
  },

  getEnrollmentCount: async (sectionId) => {
    try {
      return await SectionsModel.getEnrollmentCount(sectionId);
    } catch (error) {
      throw new Error(`Error fetching enrollment count: ${error.message}`);
    }
  },
};

export default SectionsService;
