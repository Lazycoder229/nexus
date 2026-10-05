// services/admissions.service.js
import db from "../config/db.js";
import * as admissionModel from "../model/admissions.model.js";
import {
  sendAdmissionStatusEmail,
  sendAdmissionSubmittedEmail,
} from "./email.service.js";

export const listAdmissions = async () => {
  return await admissionModel.getAllAdmissions();
};

export const getAdmission = async (id) => {
  const admission = await admissionModel.getAdmissionById(id);
  if (!admission) throw new Error("Admission not found");
  return admission;
};

export const addAdmission = async (data) => {
  const admission = await admissionModel.createAdmission(data);
  sendAdmissionSubmittedEmail({
    to: admission.email,
    firstName: admission.first_name,
    program: admission.program_applied,
  }).catch((error) => console.error("Admission email failed:", error.message));
  return admission;
};

export const editAdmission = async (id, data, options = {}) => {
  const previous = await getAdmission(id);
  const updated = await admissionModel.updateAdmission(id, data);
  const previousStatus = String(previous.status || "").toLowerCase();
  const updatedStatus = String(updated.status || "").toLowerCase();

  if (!options.skipEmail && previousStatus !== updatedStatus && updatedStatus) {
    sendAdmissionStatusEmail({
      to: updated.email,
      firstName: updated.first_name,
      status: updated.status,
      program: updated.program_applied,
      yearLevel: updated.year_level,
      remarks: updated.remarks,
    }).catch((error) => console.error("Admission status email failed:", error.message));
  }

  return updated;
};

export const removeAdmission = async (id) => {
  await getAdmission(id);
  return await admissionModel.deleteAdmission(id);
};

export const bulkEnrollAdmissions = async (
  admissionIds,
  targetYearLevel = null,
  options = {}
) => {
  const { sendEmail = true, remarks = "Official enrollment confirmed. Welcome to NexusERP!" } = options;
  const results = {
    enrolled: 0,
    failed: 0,
    emails_sent: 0,
    emails_failed: 0,
    errors: [],
  };

  for (let i = 0; i < admissionIds.length; i++) {
    const admissionId = admissionIds[i];
    try {
      const admission = await getAdmission(admissionId);
      const effectiveYearLevel = targetYearLevel || admission.year_level || "1st Year";
      const effectiveRemarks = remarks !== undefined && remarks !== null && remarks !== "" ? remarks : admission.remarks;

      // Update admission status to Enrolled; skipEmail: true so we handle sequential Gmail sending with rate pacing
      await editAdmission(
        admissionId,
        {
          ...admission,
          status: "Enrolled",
          year_level: effectiveYearLevel,
          remarks: effectiveRemarks,
        },
        { skipEmail: true }
      );

      // Also sync year_level with student_details if student account exists
      if (admission.email) {
        try {
          await db.query(
            `UPDATE student_details sd
             INNER JOIN users u ON sd.user_id = u.user_id
             SET sd.year_level = ?
             WHERE u.email = ? COLLATE utf8mb4_unicode_ci`,
            [effectiveYearLevel, admission.email]
          );
        } catch (syncErr) {
          console.error("Warning syncing student_details year_level:", syncErr);
        }
      }

      results.enrolled++;

      // Send Gmail confirmation if requested
      if (sendEmail) {
        const recipientEmail = String(admission.email || "").trim();
        if (recipientEmail && recipientEmail.includes("@")) {
          // Pacing delay between sequential emails to avoid Gmail SMTP connection throttling
          if (results.emails_sent > 0 || results.emails_failed > 0) {
            await new Promise((r) => setTimeout(r, 400));
          }

          try {
            const emailResult = await sendAdmissionStatusEmail({
              to: recipientEmail,
              firstName: admission.first_name,
              status: "Enrolled",
              program: admission.program_applied,
              yearLevel: effectiveYearLevel,
              remarks: effectiveRemarks,
            });

            if (emailResult && emailResult.delivered) {
              results.emails_sent++;
            } else {
              results.emails_failed++;
              console.warn(`Gmail delivery failed for ${recipientEmail}:`, emailResult?.error);
            }
          } catch (emailErr) {
            results.emails_failed++;
            console.error(`Error sending Gmail to ${recipientEmail}:`, emailErr.message);
          }
        } else {
          // Missing valid email address for applicant
          results.emails_failed++;
        }
      }
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
