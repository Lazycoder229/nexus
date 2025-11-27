// controllers/admissions.controller.js
import * as admissionService from "../services/admissions.service.js";

export const getAllAdmissions = async (req, res) => {
  try {
    const admissions = await admissionService.listAdmissions();
    res.json(admissions);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch admissions", error: err.message });
  }
};

export const getAdmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await admissionService.getAdmission(id);
    res.json(admission);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: err.message });
  }
};

export const createAdmission = async (req, res) => {
  try {
    const admission = await admissionService.addAdmission(req.body);
    res.status(201).json(admission);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

export const updateAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await admissionService.editAdmission(id, req.body);
    res.json(admission);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

export const deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    await admissionService.removeAdmission(id);
    res.json({ message: "Admission deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};
