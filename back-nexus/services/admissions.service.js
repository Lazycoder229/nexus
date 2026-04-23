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
