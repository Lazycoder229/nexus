import ScholarshipBeneficiariesModel from "../model/scholarshipBeneficiaries.model.js";

const ScholarshipBeneficiariesService = {
  async getAllBeneficiaries(filters) {
    return await ScholarshipBeneficiariesModel.getAllBeneficiaries(filters);
  },

  async getBeneficiaryById(id) {
    const beneficiary = await ScholarshipBeneficiariesModel.getBeneficiaryById(id);
    if (!beneficiary) {
      throw new Error("Beneficiary not found");
    }
    return beneficiary;
  },

  async createBeneficiary(data) {
    // Validate required fields
    if (!data.application_id || !data.scholarship_type_id || !data.student_id) {
      throw new Error("Application, scholarship type, and student are required");
    }

    if (!data.start_date || !data.end_date || !data.total_grant_amount) {
      throw new Error("Start date, end date, and total grant amount are required");
    }

    const id = await ScholarshipBeneficiariesModel.createBeneficiary(data);
    return await ScholarshipBeneficiariesModel.getBeneficiaryById(id);
  },

  async updateBeneficiary(id, data) {
    const existing = await ScholarshipBeneficiariesModel.getBeneficiaryById(id);
    if (!existing) {
      throw new Error("Beneficiary not found");
    }

    // Update disbursement status based on amounts
    if (data.total_disbursed !== undefined && data.total_grant_amount !== undefined) {
      if (data.total_disbursed >= data.total_grant_amount) {
        data.disbursement_status = 'Completed';
      } else if (data.total_disbursed > 0) {
        data.disbursement_status = 'Partial';
      } else {
        data.disbursement_status = 'Pending';
      }
    }

    await ScholarshipBeneficiariesModel.updateBeneficiary(id, data);
    return await ScholarshipBeneficiariesModel.getBeneficiaryById(id);
  },

  async deleteBeneficiary(id) {
    const existing = await ScholarshipBeneficiariesModel.getBeneficiaryById(id);
    if (!existing) {
      throw new Error("Beneficiary not found");
    }
    return await ScholarshipBeneficiariesModel.deleteBeneficiary(id);
  },

  async getStatistics() {
    return await ScholarshipBeneficiariesModel.getStatistics();
  },
};

export default ScholarshipBeneficiariesService;
