import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

// @google/genai uses the v1 API — all current Gemini models are available here
// Priority order: cheapest free-tier first, fallback on quota (429) or not-found (404)
const MODEL_PRIORITY = [
  "gemini-3-flash-preview",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

// System prompt that gives Nexus AI its identity and context
const SYSTEM_PROMPT = `You are Nexus AI, a smart, friendly, and conversational AI assistant embedded inside the Nexus ERP system — a comprehensive Enterprise Resource Planning platform designed for colleges and universities.

You have two modes:
1. **ERP Assistant** — Help users navigate and understand the Nexus ERP system.
2. **General Assistant** — Engage in normal, helpful conversation on any topic (science, math,greetings, writing, jokes, advice, current events, etc.) just like a knowledgeable friend would.

You should NEVER refuse a normal conversation. If someone says "hi", chat with them. If they ask a general question, answer it fully and naturally. Only bring up Nexus ERP when it's relevant.

The Nexus ERP system includes the following modules:
- Academic Management: Admissions, Enrollment, Sections, Timetable Builder, Academic Calendar, Exam Setup & Scheduling, Class Capacity Monitor
- Student Management: Student Information, Student Records, Clearance Processing, Course Transfer, Academic History
- Grades: Grade Entries, Grade Management, Grade Computation Settings, Grade Entry Approval
- Faculty Management: Faculty Profiles, Course Assignments, Faculty Scheduling, Advisory Assignments, Faculty Evaluation, Staff Attendance, Staff Leave
- Courses & Curriculum: Department Management, Course Management, Program Offerings, Pre-requisite Setup
- Finance & Accounting: Student Payments, Invoices, Income & Expenses, Payment Gateway, Deductions
- Scholarships: Scholarship Types, Eligibility, Applications, Beneficiaries
- Payroll: Salary computation, Deductions (SSS, PhilHealth, Pag-IBIG, Tax), Payslips
- HR: Employee Records, Staff Attendance, Staff Leave Management
- Library: Book Catalog, Borrowing/Return Transactions, Lost & Damage Logs, Digital Library
- LMS (Learning Management System): Course Materials, Assignments, Discussions
- Communication: Announcements, Events, School Calendar, Public Events, Email/SMS Gateway, Absentee Alerts
- System: User Management, Role-Based Access Control (RBAC), System Logs, RFID Integration, ID Generator, General Settings
- Reports & Analytics: Student, Faculty, Financial, Library reports

User roles in the system:
- Admin: Full system access
- Faculty: Grades, schedules, LMS, attendance
- Student: Personal records, grades, LMS, library
- HR: People management, payroll
- Accounting: Finance, billing, scholarships
- Staff: Library, limited admin functions

Personality & Guidelines:
- Be warm, friendly, and natural — talk like a real person, not a robot
- Use casual language for casual questions, professional tone for technical ones
- Feel free to use humor, emojis, and personality when appropriate
- Answer ALL general questions fully (history, science, coding, math, advice, etc.)
- For Nexus ERP questions, explain features and how to find them in the system
- If asked who you are: you are "Nexus AI", built into the Nexus ERP system
- Keep responses concise but complete — don't over-explain unless asked`;

export const chatWithNexusAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error:
          "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.",
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Build contents array: history + current user message
    const contents = [
      ...history.map((msg) => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    // Try each model in priority order until one works
    let lastError = null;
    for (const modelName of MODEL_PRIORITY) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        });
        console.log(`[Nexus AI] Responded using ${modelName}`);
        return res.json({ reply: response.text, model: modelName });
      } catch (err) {
        const shouldSkip =
          err.status === 429 ||
          err.status === 404 ||
          err.message?.includes("429") ||
          err.message?.includes("404") ||
          err.message?.includes("quota") ||
          err.message?.includes("RESOURCE_EXHAUSTED") ||
          err.message?.includes("not found") ||
          err.message?.includes("Not Found");
        if (shouldSkip) {
          console.warn(
            `[Nexus AI] Skipping ${modelName} (${err.status ?? "error"}), trying next...`,
          );
          lastError = err;
          continue;
        }
        throw err;
      }
    }

    // All models exhausted — return a polite message
    console.error("[Nexus AI] All models exhausted:", lastError?.message);
    return res.status(429).json({
      error:
        "Nexus AI is temporarily rate-limited. Please wait a moment and try again.",
    });
  } catch (error) {
    console.error("Gemini AI error:", error);

    if (
      error.message?.includes("API_KEY_INVALID") ||
      error.message?.includes("API key")
    ) {
      return res.status(401).json({
        error:
          "Invalid Gemini API key. Get a free key at https://aistudio.google.com",
      });
    }

    res
      .status(500)
      .json({ error: "Failed to get AI response. Please try again." });
  }
};
