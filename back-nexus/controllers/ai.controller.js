import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

// ERP-aware knowledge base used for semantic matching
const KNOWLEDGE_BASE = [
  {
    questions: [
      "hello",
      "hi",
      "hey",
      "howdy",
      "good morning",
      "good afternoon",
      "good evening",
      "greetings",
    ],
    answer:
      "Hi there! I'm Nexus AI. I can help with questions about Nexus ERP and its features. What would you like to know?",
  },
  {
    questions: [
      "how are you",
      "how are you doing",
      "how do you do",
      "what's up",
      "whats up",
    ],
    answer:
      "I'm doing well, thanks for asking! What can I help you with in Nexus ERP?",
  },
  {
    questions: [
      "who are you",
      "what are you",
      "your name",
      "your identity",
      "are you ai",
      "are you a bot",
    ],
    answer:
      "I'm Nexus AI, your assistant for Nexus ERP. I can help explain the system's modules and guide you through common tasks.",
  },
  {
    questions: [
      "what is nexus",
      "what is nexus erp",
      "what does nexus do",
      "tell me about nexus",
      "describe nexus",
    ],
    answer:
      "Nexus is a comprehensive ERP platform built for colleges and universities. It covers academics, student management, grades, faculty, finance, scholarships, payroll, HR, library, LMS, and more!",
  },
  {
    questions: [
      "help",
      "what can you do",
      "your features",
      "capabilities",
      "how can you help",
    ],
    answer:
      "I can help you navigate Nexus ERP, including enrollment, grades, payments, the library, faculty schedules, and more. What would you like help with?",
  },
  {
    questions: [
      "enrollment",
      "how to enroll",
      "how do i enroll",
      "student enrollment",
      "enroll student",
    ],
    answer:
      "To enroll students, go to Academic Management → Enrollment. Admin or Registrar roles can process enrollment for each academic period.",
  },
  {
    questions: [
      "grades",
      "how to enter grades",
      "grade entry",
      "submit grades",
      "faculty grades",
    ],
    answer:
      "Grades can be entered via Grades → Grade Entries. Faculty input and submit grades, which then go through an admin approval workflow.",
  },
  {
    questions: [
      "payment",
      "how to pay",
      "tuition payment",
      "billing",
      "invoice",
      "fees",
      "tuition",
    ],
    answer:
      "Payments and billing are in Finance & Accounting → Student Payments and Invoices. Students can view invoices, and accounting staff can process payments.",
  },
  {
    questions: [
      "library",
      "borrow book",
      "book borrowing",
      "return book",
      "library transaction",
    ],
    answer:
      "The Library module covers the book catalog, borrowing/return transactions, and lost/damage logs. Access it from the Library section in the sidebar.",
  },
  {
    questions: [
      "scholarship",
      "apply for scholarship",
      "scholarship application",
      "financial aid",
    ],
    answer:
      "Scholarships are under the Scholarships module. Students can apply, and admins manage types, eligibility, and beneficiaries.",
  },
  {
    questions: [
      "payroll",
      "salary",
      "payslip",
      "employee salary",
      "staff salary",
      "deduction",
    ],
    answer:
      "Payroll covers salary computation, deductions (SSS, PhilHealth, Pag-IBIG, Tax), and payslip generation — all under the Payroll module.",
  },
  {
    questions: [
      "faculty",
      "teacher",
      "professor",
      "faculty schedule",
      "faculty assignment",
    ],
    answer:
      "Faculty management includes profiles, course assignments, scheduling, advisory assignments, evaluations, and attendance — all under the Faculty Management section.",
  },
  {
    questions: [
      "lms",
      "learning management system",
      "course materials",
      "assignments",
      "discussions",
      "online class",
    ],
    answer:
      "The LMS module includes course materials, assignments, and discussions. Faculty can upload content and create assignments for students.",
  },
  {
    questions: [
      "announcement",
      "announcements",
      "school news",
      "news",
      "notice",
    ],
    answer:
      "Announcements are in the Communication section. Admins can post school-wide notices visible to all users.",
  },
  {
    questions: [
      "schedule",
      "timetable",
      "class schedule",
      "timetable builder",
      "build schedule",
    ],
    answer:
      "The Timetable Builder is under Academic Management. Admins can create class schedules, assign rooms, and manage time slots.",
  },
  {
    questions: [
      "admission",
      "admissions",
      "how to admit",
      "new student",
      "applicant",
    ],
    answer:
      "Admissions are under Academic Management → Admissions. Staff can process applications and accept or reject applicants.",
  },
  {
    questions: [
      "clearance",
      "student clearance",
      "get clearance",
      "clearance process",
    ],
    answer:
      "Student clearances are under Student Management → Clearance Processing. Each department marks clearance status before a student can get their credentials.",
  },
  {
    questions: [
      "user",
      "user management",
      "add user",
      "create account",
      "rbac",
      "roles",
      "permissions",
    ],
    answer:
      "User management and RBAC are under System → User Management and RBAC. Admins can create users and assign roles.",
  },
  {
    questions: [
      "report",
      "reports",
      "generate report",
      "analytics",
      "data report",
    ],
    answer:
      "Reports & Analytics covers student, faculty, financial, and library reports. Access them from the Reports section in the sidebar.",
  },
  {
    questions: ["rfid", "rfid card", "id card", "student id"],
    answer:
      "RFID integration is under System → RFID Integration. It supports card-based attendance and access management.",
  },
  {
    questions: [
      "thank you",
      "thanks",
      "thank u",
      "many thanks",
      "appreciate it",
    ],
    answer: "You're welcome! Let me know if you need anything else. 😊",
  },
  {
    questions: ["bye", "goodbye", "see you", "see ya", "farewell", "take care"],
    answer: "Goodbye! Come back anytime if you need help with Nexus ERP. 👋",
  },
  {
    questions:["code","give me a code","write a code"],
    answer:"Sorry, I can't help you with that. Please use large language model. Thank you."
  }
];

// Flatten into individual sentence–answer pairs for embedding
const KB_ENTRIES = KNOWLEDGE_BASE.flatMap(({ questions, answer }) =>
  questions.map((q) => ({ question: q, answer })),
);

const FALLBACK_STOP_WORDS = new Set([
  "a", "an", "and", "are", "can", "do", "does", "for", "how", "i",
  "in", "is", "it", "me", "my", "of", "on", "please", "the", "to",
  "what", "where", "which", "who", "with", "you", "your",
]);

const normalizeFallbackText = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const fallbackTokens = (text) =>
  normalizeFallbackText(text)
    .split(" ")
    .filter((word) => word.length > 1 && !FALLBACK_STOP_WORDS.has(word));

// Local keyword fallback: works without Google credentials or ML packages.
const offlineFallbackResponse = (message) => {
  const normalizedMessage = normalizeFallbackText(message);
  const messageTokens = new Set(fallbackTokens(message));
  let bestEntry = null;
  let bestScore = 0;

  for (const entry of KB_ENTRIES) {
    const normalizedQuestion = normalizeFallbackText(entry.question);
    const questionTokens = new Set(fallbackTokens(entry.question));
    if (!normalizedQuestion || questionTokens.size === 0) continue;

    let score = 0;
    if (normalizedMessage === normalizedQuestion) {
      score = 1;
    } else if (` ${normalizedMessage} `.includes(` ${normalizedQuestion} `)) {
      score = 0.9 + Math.min(normalizedQuestion.length / 1000, 0.09);
    } else {
      let overlap = 0;
      for (const token of questionTokens) {
        if (messageTokens.has(token)) overlap += 1;
      }
      score =
        (overlap / questionTokens.size) * 0.7 +
        (overlap / Math.max(messageTokens.size, 1)) * 0.3;
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  const confidentMatch = bestScore >= 0.48 && bestEntry;
  return {
    reply: confidentMatch
      ? bestEntry.answer
      : "I can help with Nexus ERP topics such as enrollment, grades, payments, the library, and faculty schedules. Could you rephrase your question or tell me which area you need help with?",
    model: confidentMatch ? "offline/knowledge-base" : "offline/fallback",
  };
};

// ---------------------------------------------------------------------------
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
3. **Coding help** - Dont give code to use if they are asking to give a code of anylanguage. Always tell them you dont know the they are talking. Tell them to used coding agents like claude, codex etc. 
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
      console.warn(
        "[Nexus AI] No GEMINI_API_KEY found — using the local knowledge-base fallback.",
      );
      const fallback = offlineFallbackResponse(message);
      return res.json(fallback);
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
          continue;
        }
        throw err;
      }
    }

    // All Gemini models exhausted — fall back to the local knowledge base.
    console.warn(
      "[Nexus AI] All Gemini models exhausted — switching to the local knowledge-base fallback.",
    );
    const fallback = offlineFallbackResponse(message);
    return res.json(fallback);
  } catch (error) {
    console.error("Gemini AI error:", error);
    return res.json(offlineFallbackResponse(message));
  }
};
