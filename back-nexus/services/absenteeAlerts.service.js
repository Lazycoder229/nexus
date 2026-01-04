import AbsenteeAlertsModel from "../model/absenteeAlerts.model.js";

const AbsenteeAlertsService = {
  // Get all absentee alerts
  async getAllAbsenteeAlerts(filters) {
    try {
      return await AbsenteeAlertsModel.getAll(filters);
    } catch (error) {
      throw new Error(`Error fetching absentee alerts: ${error.message}`);
    }
  },

  // Get absentee alert by ID
  async getAbsenteeAlertById(id) {
    try {
      const alert = await AbsenteeAlertsModel.getById(id);
      if (!alert) {
        throw new Error("Absentee alert not found");
      }
      return alert;
    } catch (error) {
      throw new Error(`Error fetching absentee alert: ${error.message}`);
    }
  },

  // Create absentee alert
  async createAbsenteeAlert(data) {
    try {
      const alertId = await AbsenteeAlertsModel.create(data);
      return await AbsenteeAlertsModel.getById(alertId);
    } catch (error) {
      throw new Error(`Error creating absentee alert: ${error.message}`);
    }
  },

  // Update absentee alert
  async updateAbsenteeAlert(id, data) {
    try {
      const affectedRows = await AbsenteeAlertsModel.update(id, data);
      if (affectedRows === 0) {
        throw new Error("Absentee alert not found");
      }
      return await AbsenteeAlertsModel.getById(id);
    } catch (error) {
      throw new Error(`Error updating absentee alert: ${error.message}`);
    }
  },

  // Delete absentee alert
  async deleteAbsenteeAlert(id) {
    try {
      const affectedRows = await AbsenteeAlertsModel.delete(id);
      if (affectedRows === 0) {
        throw new Error("Absentee alert not found");
      }
      return { message: "Absentee alert deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting absentee alert: ${error.message}`);
    }
  },

  // Acknowledge alert
  async acknowledgeAlert(id, acknowledgedBy, resolutionNotes = null) {
    try {
      const updateData = {
        status: "acknowledged",
        acknowledged_by: acknowledgedBy,
        resolution_notes: resolutionNotes,
      };
      return await this.updateAbsenteeAlert(id, updateData);
    } catch (error) {
      throw new Error(`Error acknowledging alert: ${error.message}`);
    }
  },

  // Resolve alert
  async resolveAlert(id, acknowledgedBy, resolutionNotes) {
    try {
      const updateData = {
        status: "resolved",
        acknowledged_by: acknowledgedBy,
        resolution_notes: resolutionNotes,
      };
      return await this.updateAbsenteeAlert(id, updateData);
    } catch (error) {
      throw new Error(`Error resolving alert: ${error.message}`);
    }
  },

  // Get alert statistics
  async getAlertStatistics(filters) {
    try {
      return await AbsenteeAlertsModel.getStatistics(filters);
    } catch (error) {
      throw new Error(`Error fetching alert statistics: ${error.message}`);
    }
  },
};

export default AbsenteeAlertsService;
