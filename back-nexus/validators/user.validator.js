import { z } from "zod";

/* ==========================================
   REUSABLE FIELD DEFINITIONS
   ========================================== */

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const phoneField = z
  .string()
  .min(7, "Phone number too short")
  .max(20, "Phone number too long")
  .optional()
  .nullable();

const nameField = (label) =>
  z.string().min(1, `${label} is required`).max(100, `${label} too long`);

const optionalString = z.string().optional().nullable();

/* ==========================================
   AUTH SCHEMAS
   ========================================== */

export const loginSchema = z.object({
  email: z.string().min(1, "Email or ID is required"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordField,
    newPasswordConfirm: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Passwords do not match",
    path: ["newPasswordConfirm"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

/* ==========================================
   STUDENT SCHEMAS
   ========================================== */

export const registerStudentSchema = z.object({
  // Account
  systemId: optionalString,
  email: z.string().email("Invalid email format"),
  password: passwordField,
  confirmPassword: z.string().min(1, "Please confirm your password"),

  // Personal
  firstName: nameField("First name"),
  middleName: optionalString,
  lastName: nameField("Last name"),
  suffix: z.enum(["", "Jr.", "Sr.", "III", "IV"]).optional().nullable(),
  dob: z.string().optional().nullable(),
  gender: z
    .enum(["Male", "Female", "Non-Binary", "Prefer not to say", ""])
    .optional()
    .nullable(),
  phone: phoneField,
  parentPhone: phoneField,
  permanentAddress: optionalString,
  mailingAddress: optionalString,
  fatherName: optionalString,
  motherName: optionalString,

  // Academic
  studentNumber: optionalString,
  course: z.string().min(1, "Course is required"),
  major: optionalString,
  yearLevel: z
    .enum([
      "",
      "1st Year",
      "2nd Year",
      "3rd Year",
      "4th Year",
      "5th Year",
      "Irregular",
    ])
    .optional()
    .nullable(),
  previousSchool: optionalString,
  yearGraduated: z
    .string()
    .max(4, "Invalid year")
    .regex(/^\d{0,4}$/, "Must be a valid year")
    .optional()
    .nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const updateStudentSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  firstName: nameField("First name").optional(),
  middleName: optionalString,
  lastName: nameField("Last name").optional(),
  suffix: z.enum(["", "Jr.", "Sr.", "III", "IV"]).optional().nullable(),
  dob: optionalString,
  gender: z
    .enum(["Male", "Female", "Non-Binary", "Prefer not to say", ""])
    .optional()
    .nullable(),
  phone: phoneField,
  parentPhone: phoneField,
  permanentAddress: optionalString,
  mailingAddress: optionalString,
  fatherName: optionalString,
  motherName: optionalString,
  studentNumber: optionalString,
  course: optionalString,
  major: optionalString,
  yearLevel: optionalString,
  previousSchool: optionalString,
  yearGraduated: optionalString,
});

/* ==========================================
   EMPLOYEE SCHEMAS
   ========================================== */

export const registerEmployeeSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: passwordField,
  firstName: nameField("First name"),
  middleName: optionalString,
  lastName: nameField("Last name"),
  suffix: z.enum(["", "Jr.", "Sr.", "III", "IV"]).optional().nullable(),
  dateOfBirth: optionalString,
  gender: z
    .enum(["Male", "Female", "Non-Binary", "Prefer not to say", ""])
    .optional()
    .nullable(),
  phone: phoneField,
  permanentAddress: optionalString,
  role: z
    .enum(["Admin", "Faculty", "Staff", "HR", "Accounting"])
    .default("Staff"),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: optionalString,
  positionTitle: optionalString,
  dateHired: optionalString,
  specialization: optionalString,
  educationalAttainment: optionalString,
  licenseNumber: optionalString,
  accessLevel: optionalString,
});

export const updateEmployeeSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  firstName: optionalString,
  middleName: optionalString,
  lastName: optionalString,
  suffix: z.enum(["", "Jr.", "Sr.", "III", "IV"]).optional().nullable(),
  dateOfBirth: optionalString,
  gender: optionalString,
  phone: phoneField,
  permanentAddress: optionalString,
  profilePictureBase64: optionalString,
  status: z.enum(["Active", "Inactive"]).optional(),
  employeeId: optionalString,
  department: optionalString,
  positionTitle: optionalString,
  dateHired: optionalString,
  specialization: optionalString,
  educationalAttainment: optionalString,
  licenseNumber: optionalString,
  accessLevel: optionalString,
});