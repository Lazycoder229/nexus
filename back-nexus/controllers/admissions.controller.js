// controllers/admissions.controller.js
import * as admissionService from "../services/admissions.service.js";

export const getAllAdmissions = async (req, res) => {
  try {
    const { email } = req.query;

    // If email query param is provided, fetch student's specific admissions only
    if (email) {
      const admissions = await admissionService.listAdmissions();
      const filtered = admissions.filter(
        (a) => a.email && a.email.toLowerCase() === email.toLowerCase(),
      );
      return res.json(filtered);
    }

    // Otherwise return all admissions (for admin views)
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

export const bulkEnroll = async (req, res) => {
  try {
    const { admission_ids, year_level, send_email = true, remarks } = req.body;

    if (!admission_ids || !Array.isArray(admission_ids) || admission_ids.length === 0) {
      return res.status(400).json({ message: "No admission IDs provided" });
    }

    const shouldSendEmail = send_email !== false && send_email !== "false";
    const results = await admissionService.bulkEnrollAdmissions(admission_ids, year_level, {
      sendEmail: shouldSendEmail,
      remarks,
    });

    let message = `Successfully enrolled ${results.enrolled} applicant(s)`;
    if (shouldSendEmail) {
      message += ` and sent ${results.emails_sent} Gmail confirmation(s)`;
      if (results.emails_failed > 0) {
        message += ` (${results.emails_failed} email(s) not delivered or missing email)`;
      }
    }

    res.json({
      message,
      enrolled: results.enrolled,
      failed: results.failed,
      emails_sent: results.emails_sent,
      emails_failed: results.emails_failed,
      errors: results.errors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Bulk enrollment failed", error: err.message });
  }
};
