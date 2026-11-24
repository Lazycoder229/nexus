import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ENROLLMENT_DATASET_PATH = path.resolve(
  __dirname,
  "../data/enrollment_training_dataset.json",
);

export const generateEnrollmentTrainingDatasetFile = async () => {
  const [programRows] = await db.query(`
    SELECT COALESCE(p.name, sd.course, 'Other Program') AS program,
           COUNT(DISTINCT e.student_id) AS category_rank
    FROM enrollments e
    LEFT JOIN student_details sd ON sd.user_id = e.student_id
    LEFT JOIN programs p ON p.name = sd.course OR p.code = sd.course
    GROUP BY COALESCE(p.name, sd.course, 'Other Program')
    ORDER BY category_rank DESC, program ASC
  `);

  if (!programRows.length) {
    const error = new Error("No program categories are available to build the training dataset.");
    error.code = "NO_ENROLLMENT_DATA";
    throw error;
  }

  const programs = programRows.map((row) => row.program);
  const shares = programs.length === 1
    ? [1]
    : programs.length === 2
      ? [0.7, 0.3]
      : [0.65, 0.28, ...Array(Math.max(0, programs.length - 2)).fill(0.07 / (programs.length - 2))];
  const termPlan = [
    { academic_year: "2024-2025", semester: "1st Semester", total: 920 },
    { academic_year: "2024-2025", semester: "2nd Semester", total: 940 },
    { academic_year: "2025-2026", semester: "1st Semester", total: 960 },
    { academic_year: "2025-2026", semester: "2nd Semester", total: 980 },
    { academic_year: "2026-2027", semester: "1st Semester", total: 1000 },
  ];
  const distribute = (total) => {
    const counts = shares.map((share) => Math.floor(total * share));
    let remaining = total - counts.reduce((sum, count) => sum + count, 0);
    for (let i = 0; remaining > 0; i = (i + 1) % counts.length, remaining -= 1) counts[i] += 1;
    return counts;
  };
  const groupPlan = termPlan.flatMap((term, period_index) => {
    const counts = distribute(term.total);
    return programs.map((program, program_index) => ({
      academic_year: term.academic_year,
      semester: term.semester,
      period_label: `${term.academic_year} - ${term.semester}`,
      period_index,
      program,
      program_index,
      program_share: shares[program_index],
      enrollment_count: counts[program_index],
    }));
  });
  const student_records = groupPlan.flatMap((group) => Array.from(
    { length: group.enrollment_count },
    (_, index) => ({
      synthetic_record_id: `SYN-${group.period_index + 1}-${group.program_index + 1}-${String(index + 1).padStart(4, "0")}`,
      academic_year: group.academic_year,
      semester: group.semester,
      period_label: group.period_label,
      period_index: group.period_index,
      program: group.program,
      program_index: group.program_index,
      source_type: "synthetic_pattern",
    }),
  ));
  const recordCounts = new Map();
  for (const record of student_records) {
    const key = `${record.period_index}:${record.program_index}`;
    recordCounts.set(key, (recordCounts.get(key) || 0) + 1);
  }
  const samples = groupPlan.map((group) => ({
    ...group,
    period_id: null,
    enrollment_count: recordCounts.get(`${group.period_index}:${group.program_index}`) || 0,
    source_type: "synthetic_pattern",
  }));

  const dataset = {
    dataset_name: "Synthetic semester enrollment by program training dataset",
    generated_at: new Date().toISOString(),
    source: "Synthetic pattern data; current database is used only for program category labels and ordering",
    aggregation: "Generated student totals for each program in each academic semester",
    target: "synthetic semester enrollment_count by program",
    sample_count: samples.length,
    actual_sample_count: 0,
    synthetic_sample_count: samples.length,
    synthetic_student_record_count: student_records.length,
    synthetic_students_per_semester: termPlan.map(({ academic_year, semester, total }) => ({
      period_label: `${academic_year} - ${semester}`,
      total_students: total,
    })),
    synthetic_pattern: "All enrollment counts are generated examples, not historical database records. Semester totals rise from 920 to 1,000, split across programs using a fixed 65% / 28% / remaining share pattern. Each term represents an academic semester.",
    programs: programs.map((program, index) => ({ program, synthetic_share: shares[index] })),
    samples,
    student_records,
  };

  await fs.mkdir(path.dirname(ENROLLMENT_DATASET_PATH), { recursive: true });
  await fs.writeFile(ENROLLMENT_DATASET_PATH, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
  return JSON.parse(await fs.readFile(ENROLLMENT_DATASET_PATH, "utf8"));
};

export const readEnrollmentTrainingDataset = async () => {
  try {
    return JSON.parse(await fs.readFile(ENROLLMENT_DATASET_PATH, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
};

export const getEnrollmentTrainingDataset = async () => {
  const dataset = await readEnrollmentTrainingDataset();
  if (!dataset) {
    throw new Error("Training dataset JSON file is missing. Generate the enrollment training dataset before training.");
  }
  return dataset;
};
