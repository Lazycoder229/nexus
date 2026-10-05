/**
 * Test All Email Templates - Visual Consistency Check
 * 
 * Sends all 6 email types to the SMTP_USER inbox so you can
 * visually compare them side-by-side in Gmail.
 * 
 * Usage: node testAllEmails.js
 */
import dotenv from "dotenv";
dotenv.config();

import {
  sendVerificationEmail,
  sendAccountWelcomeEmail,
  sendPasswordChangedEmail,
  sendAdmissionSubmittedEmail,
  sendAdmissionStatusEmail,
  sendEnrollmentSubmittedEmail,
} from "./services/email.service.js";

const TEST_EMAIL = process.env.SMTP_USER; // sends to yourself

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function sendAllTestEmails() {
  console.log(`\n📬 Sending all 6 email types to: ${TEST_EMAIL}\n`);

  // 1. Verification OTP
  console.log("1️⃣  Sending Email Verification (OTP)...");
  const r1 = await sendVerificationEmail({
    to: TEST_EMAIL,
    firstName: "Juan",
    code: "849201",
    expiresMinutes: 15,
  });
  console.log(`   Result: ${r1.mode} | delivered: ${r1.delivered}`);
  await delay(2000);

  // 2. Welcome Account Created
  console.log("2️⃣  Sending Account Welcome...");
  const r2 = await sendAccountWelcomeEmail({
    to: TEST_EMAIL,
    firstName: "Juan",
    role: "Student",
    identifier: "STU-2026-00123",
    loginUrl: "http://localhost:5173",
  });
  console.log(`   Result: ${r2.mode} | delivered: ${r2.delivered}`);
  await delay(2000);

  // 3. Password Changed
  console.log("3️⃣  Sending Password Changed Alert...");
  const r3 = await sendPasswordChangedEmail({
    to: TEST_EMAIL,
    firstName: "Juan",
    changedAt: new Date().toLocaleString(),
    changedByAdmin: true,
  });
  console.log(`   Result: ${r3.mode} | delivered: ${r3.delivered}`);
  await delay(2000);

  // 4. Admission Submitted
  console.log("4️⃣  Sending Admission Submitted...");
  const r4 = await sendAdmissionSubmittedEmail({
    to: TEST_EMAIL,
    firstName: "Juan",
    program: "BS Information Technology",
  });
  console.log(`   Result: ${r4.mode} | delivered: ${r4.delivered}`);
  await delay(2000);

  // 5. Admission Status Update
  console.log("5️⃣  Sending Admission Status (Enrolled)...");
  const r5 = await sendAdmissionStatusEmail({
    to: TEST_EMAIL,
    firstName: "Juan",
    status: "Enrolled",
    program: "BS Information Technology",
    remarks: "Congratulations! All requirements verified.",
  });
  console.log(`   Result: ${r5.mode} | delivered: ${r5.delivered}`);
  await delay(2000);

  // 6. Enrollment Submitted
  console.log("6️⃣  Sending Enrollment Submitted...");
  const r6 = await sendEnrollmentSubmittedEmail({
    to: TEST_EMAIL,
    firstName: "Juan",
    course: "IT 101 - Introduction to Computing",
    schoolYear: "2026-2027",
    semester: "1st Semester",
  });
  console.log(`   Result: ${r6.mode} | delivered: ${r6.delivered}`);

  console.log("\n✅ All 6 emails sent! Check your Gmail inbox to compare.\n");
  process.exit(0);
}

sendAllTestEmails().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
