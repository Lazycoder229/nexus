// services/admissions.service.js
import * as admissionModel from "../model/admissions.model.js";

export const listAdmissions = async () => {
  return await admissionModel.getAllAdmissions();
};

export const getAdmission = async (id) => {
  const admission = await admissionModel.getAdmissionById(id);
  if (!admission) throw new Error("Admission not found");
  return admission;
};

export const addAdmission = async (data) => {
  return await admissionModel.createAdmission(data);
};

export const editAdmission = async (id, data) => {
  await getAdmission(id);
  return await admissionModel.updateAdmission(id, data);
};

export const removeAdmission = async (id) => {
  await getAdmission(id);
  return await admissionModel.deleteAdmission(id);
};

export const bulkEnrollAdmissions = async (admissionIds) => {
  const results = {
    enrolled: 0,
    failed: 0,
    errors: [],
  };

  for (const admissionId of admissionIds) {
    try {
      const admission = await getAdmission(admissionId);

      // Update admission status to Enrolled
      await admissionModel.updateAdmission(admissionId, {
        ...admission,
        status: "Enrolled",
      });

      results.enrolled++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        admission_id: admissionId,
        error: error.message,
      });
    }
  }

  return results;
};
