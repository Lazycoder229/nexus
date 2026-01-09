import LMSMaterials from "../model/lmsMaterials.model.js";

const lmsMaterialsController = {
  // Create new learning material
  create: async (req, res) => {
    try {
      const materialData = req.body;
      const materialId = await LMSMaterials.create(materialData);

      res.status(201).json({
        success: true,
        message: "Learning material created successfully",
        materialId,
      });
    } catch (error) {
      console.error("Error creating material:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create learning material",
        error: error.message,
      });
    }
  },

  // Get materials by faculty
  getByFaculty: async (req, res) => {
    try {
      const { faculty_id, academic_period_id } = req.query;

      if (!faculty_id || !academic_period_id) {
        return res.status(400).json({
          success: false,
          message: "Faculty ID and Academic Period ID are required",
        });
      }

      const materials = await LMSMaterials.getByFaculty(
        faculty_id,
        academic_period_id
      );

      res.status(200).json({
        success: true,
        materials,
      });
    } catch (error) {
      console.error("Error fetching materials:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch materials",
        error: error.message,
      });
    }
  },

  // Get materials by section
  getBySection: async (req, res) => {
    try {
      const { section_id, academic_period_id } = req.query;

      if (!section_id || !academic_period_id) {
        return res.status(400).json({
          success: false,
          message: "Section ID and Academic Period ID are required",
        });
      }

      const materials = await LMSMaterials.getBySection(
        section_id,
        academic_period_id
      );

      res.status(200).json({
        success: true,
        materials,
      });
    } catch (error) {
      console.error("Error fetching materials:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch materials",
        error: error.message,
      });
    }
  },

  // Get material by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const material = await LMSMaterials.getById(id);

      if (!material) {
        return res.status(404).json({
          success: false,
          message: "Material not found",
        });
      }

      res.status(200).json({
        success: true,
        material,
      });
    } catch (error) {
      console.error("Error fetching material:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch material",
        error: error.message,
      });
    }
  },

  // Update material
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updated = await LMSMaterials.update(id, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Material not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Material updated successfully",
      });
    } catch (error) {
      console.error("Error updating material:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update material",
        error: error.message,
      });
    }
  },

  // Delete material
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const deleted = await LMSMaterials.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Material not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Material deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting material:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete material",
        error: error.message,
      });
    }
  },

  // Track material view
  trackView: async (req, res) => {
    try {
      const { material_id, student_id } = req.body;

      await LMSMaterials.trackView(material_id, student_id);

      res.status(200).json({
        success: true,
        message: "View tracked successfully",
      });
    } catch (error) {
      console.error("Error tracking view:", error);
      res.status(500).json({
        success: false,
        message: "Failed to track view",
        error: error.message,
      });
    }
  },

  // Get material views
  getViews: async (req, res) => {
    try {
      const { material_id } = req.params;

      const views = await LMSMaterials.getViews(material_id);

      res.status(200).json({
        success: true,
        views,
      });
    } catch (error) {
      console.error("Error fetching views:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch views",
        error: error.message,
      });
    }
  },
};

export default lmsMaterialsController;
