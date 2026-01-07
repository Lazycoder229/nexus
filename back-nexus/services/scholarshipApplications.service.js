import ScholarshipApplicationsModel from "../model/scholarshipApplications.model.js";
import ScholarshipTypesModel from "../model/scholarshipTypes.model.js";

const ScholarshipApplicationsService = {
  async getAllApplications(filters) {
    return await ScholarshipApplicationsModel.getAllApplications(filters);
  },

  async getApplicationById(id) {
    const application = await ScholarshipApplicationsModel.getApplicationById(id);
    if (!application) {
      throw new Error("Application not found");
    }
    return application;
  },

  async createApplication(data) {
    // Validate required fields
    if (!data.scholarship_type_id || !data.student_id || !data.semester) {
      throw new Error("Scholarship type, student, and semester are required");
    }

    // Check if scholarship type exists and has available slots
    const scholarshipType = await ScholarshipTypesModel.getScholarshipTypeById(data.scholarship_type_id);
    if (!scholarshipType) {
      throw new Error("Scholarship type not found");
    }

    if (scholarshipType.status !== 'Active') {
      throw new Error("This scholarship is not currently active");
    }

    if (scholarshipType.slots_available <= 0) {
      throw new Error("No slots available for this scholarship");
    }

    // Generate application number
    if (!data.application_number) {
      data.application_number = await ScholarshipApplicationsModel.generateApplicationNumber();
    }

    // Set application date if not provided
    if (!data.application_date) {
      data.application_date = new Date().toISOString().split('T')[0];
    }

    const id = await ScholarshipApplicationsModel.createApplication(data);
    return await ScholarshipApplicationsModel.getApplicationById(id);
  },

  async updateApplication(id, data) {
    const existing = await ScholarshipApplicationsModel.getApplicationById(id);
    if (!existing) {
      throw new Error("Application not found");
    }

    // If approving, validate approved_amount
    if (data.status === 'Approved' && !data.approved_amount) {
      throw new Error("Approved amount is required when approving application");
    }

    // Set review/approval dates
    if (data.status === 'Under Review' && !data.review_date) {
      data.review_date = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    if (data.status === 'Approved' && !data.approval_date) {
      data.approval_date = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    await ScholarshipApplicationsModel.updateApplication(id, data);
    return await ScholarshipApplicationsModel.getApplicationById(id);
  },

  async deleteApplication(id) {
    const existing = await ScholarshipApplicationsModel.getApplicationById(id);
    if (!existing) {
      throw new Error("Application not found");
    }

    // Prevent deletion of approved applications
    if (existing.status === 'Approved') {
      throw new Error("Cannot delete approved applications");
    }

    return await ScholarshipApplicationsModel.deleteApplication(id);
  },

  async getStatistics() {
    return await ScholarshipApplicationsModel.getStatistics();
  },
};

export default ScholarshipApplicationsService;
