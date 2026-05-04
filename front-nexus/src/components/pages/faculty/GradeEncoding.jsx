import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Save,
  Search,
  Upload,
  Users,
  FileText,
  TableProperties,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import * as XLSX from "xlsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ─── Period config ──────────────────────────────────────────────────────────
const PERIODS = ["midterm", "final"];

const PERIOD_LABELS = {
  midterm: "Midterm",
  final: "Final",
};

const CAMPUS_SECTION_WEIGHTS = {
  writtenOutput: 30,
  performanceTasks: 40,
  midtermExam: 30,   // exam column weight
};

const WRITTEN_OUTPUT_ITEM_WEIGHTS = [20, 20, 20, 20, 20];
const PERFORMANCE_TASK_ITEM_WEIGHTS = [20, 20, 20, 20, 20];

// ─── Empty state helpers ─────────────────────────────────────────────────────
const EMPTY_GRADE = () => ({
  writtenOutput: ["", "", "", "", ""],
  performanceTasks: ["", "", "", "", ""],
  midtermExam: "",
});

const EMPTY_MAX_SCORE = () => ({
  writtenOutput: [100, 100, 100, 100, 100],
  performanceTasks: [100, 100, 100, 100, 100],
  midtermExam: 100,
});

const EMPTY_ACTIVITY_META = () => ({
  writtenOutput: [null, null, null, null, null],
  performanceTasks: [null, null, null, null, null],
  midtermExam: null,
});

// ─── Grade scale ─────────────────────────────────────────────────────────────
const LETTER_SCALE = [
  { min: 90, letter: "A", equivalent: "1.00", status: "PASSED" },
  { min: 80, letter: "B", equivalent: "2.00", status: "PASSED" },
  { min: 70, letter: "C", equivalent: "3.00", status: "PASSED" },
  { min: 60, letter: "D", equivalent: "4.00", status: "PASSED" },
  { min: 0,  letter: "F", equivalent: "5.00", status: "FAILED" },
];

// ─── Utility fns ─────────────────────────────────────────────────────────────
const normalizeNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const calculateSectionStats = (scores = [], maxScores = [], sectionWeight = 0) => {
  const collected = scores
    .map((score, index) => ({ score: normalizeNumber(score), maxScore: Number(maxScores[index] || 100) }))
    .filter((item) => item.score !== null && item.maxScore > 0);
  if (collected.length === 0) return { totalScore: null, percent: null, weightedScore: null };
  const totalScore = collected.reduce((sum, item) => sum + item.score, 0);
  const totalMax   = collected.reduce((sum, item) => sum + item.maxScore, 0);
  const percent    = totalMax > 0 ? (totalScore / totalMax) * 100 : null;
  const weightedScore = percent === null ? null : percent * (sectionWeight / 100);
  return {
    totalScore:    Number(totalScore.toFixed(2)),
    percent:       percent === null ? null : Number(percent.toFixed(2)),
    weightedScore: weightedScore === null ? null : Number(weightedScore.toFixed(2)),
  };
};

const calculateMidtermWeighted = (midtermScore, midtermMax = 100) => {
  const midterm = normalizeNumber(midtermScore);
  if (midterm === null || !midtermMax) return null;
  const percent = (midterm / Number(midtermMax || 100)) * 100;
  return Number((percent * (CAMPUS_SECTION_WEIGHTS.midtermExam / 100)).toFixed(2));
};

const calculateFinalGrade = (gradeRow, maxRow) => {
  const written    = calculateSectionStats(gradeRow.writtenOutput,   maxRow?.writtenOutput   || EMPTY_MAX_SCORE().writtenOutput,   CAMPUS_SECTION_WEIGHTS.writtenOutput);
  const performance = calculateSectionStats(gradeRow.performanceTasks, maxRow?.performanceTasks || EMPTY_MAX_SCORE().performanceTasks, CAMPUS_SECTION_WEIGHTS.performanceTasks);
  const midtermWeighted = calculateMidtermWeighted(gradeRow.midtermExam, maxRow?.midtermExam || EMPTY_MAX_SCORE().midtermExam);
  if (written.weightedScore === null || performance.weightedScore === null || midtermWeighted === null) return null;
  return Number((written.weightedScore + performance.weightedScore + midtermWeighted).toFixed(2));
};

const getLetterInfo = (score) => {
  if (score === null) return { letter: "-", equivalent: "-", status: "-" };
  return LETTER_SCALE.find((range) => score >= range.min) || LETTER_SCALE[LETTER_SCALE.length - 1];
};

// Numerical equivalent mapping for grading report
const getNumericalEquivalent = (grade) => {
  if (grade === null) return null;
  if (grade >= 90) return 1.00;
  if (grade >= 80) return 2.00;
  if (grade >= 70) return 3.00;
  if (grade >= 60) return 4.00;
  return 5.00;
};

const extractComponentOrder = (name = "") => {
  const match = String(name).match(/(\d+)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const GradeEncoding = () => {
  const [loading, setLoading]           = useState(false);
  const [courses, setCourses]           = useState([]);
  const [students, setStudents]         = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchTerm, setSearchTerm]     = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [activePeriodId, setActivePeriodId] = useState("");
  const [entryMap, setEntryMap]         = useState({});
  const [activityMeta, setActivityMeta] = useState(EMPTY_ACTIVITY_META());

  // period = "midterm" | "final"
  const [period, setPeriod] = useState("midterm");

  // view = "encoding" | "report"
  const [view, setView] = useState("encoding");

  // Per-period grade/max data: { midterm: { [studentId]: gradeRow }, final: ... }
  const [gradesMap, setGradesMap]       = useState({ midterm: {}, final: {} });
  const [maxScoresMap, setMaxScoresMap] = useState({ midterm: {}, final: {} });

  const lastAutoSyncRef = useRef(null);
  const itemsPerPage = 10;

  // Convenience accessors for current period
  const grades    = gradesMap[period] || {};
  const maxScores = maxScoresMap[period] || {};

  const setGrades = (updater) =>
    setGradesMap((prev) => {
      const next = typeof updater === "function" ? updater(prev[period] || {}) : updater;
      return { ...prev, [period]: next };
    });

  const setMaxScores = (updater) =>
    setMaxScoresMap((prev) => {
      const next = typeof updater === "function" ? updater(prev[period] || {}) : updater;
      return { ...prev, [period]: next };
    });

  // ─── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => { fetchCoursesAndStudents(); }, []);

  const fetchCoursesAndStudents = async () => {
    setLoading(true);
    try {
      const [coursesRes, enrollmentsRes, activePeriodRes] = await Promise.all([
        axios.get(`${API_BASE}/api/course/courses`),
        axios.get(`${API_BASE}/api/enrollments`),
        axios.get(`${API_BASE}/api/academic-periods/active`).catch(() => ({ data: null })),
      ]);

      const courseRows = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.data || []);
      const mappedCourses = courseRows.map((c) => ({
        id: c.course_id || c.id,
        code: c.code || c.course_code || "",
        name: c.title || c.name || c.course_name || "",
        section: c.section || "A",
      }));

      const enrollmentRows = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : (enrollmentsRes.data?.data || []);
      const mappedStudents = enrollmentRows.map((e, i) => ({
        id:         e.enrollment_id || e.student_id || e.user_id || i + 1,
        userId:     e.student_id || e.user_id || null,
        studentId:  e.student_number || e.student_id || e.user_id || `STU-${i + 1}`,
        firstName:  e.first_name || e.student_name?.split(" ")?.[0] || e.name?.split(" ")?.[0] || "Student",
        lastName:   e.last_name  || e.student_name?.split(" ")?.[1] || e.name?.split(" ")?.[1] || "",
        courseId:   e.course_id || null,
        course:     e.course_code || mappedCourses.find((c) => c.id === e.course_id)?.code || "N/A",
      }));

      const activePeriod = activePeriodRes.data?.period || activePeriodRes.data || null;
      if (activePeriod) {
        const periodId = activePeriod.period_id ?? activePeriod.id ?? activePeriod.periodId ?? null;
        if (periodId) setActivePeriodId(String(periodId));
      }

      setCourses(mappedCourses);
      setStudents(mappedStudents);

      // Initialise empty grades for all periods
      setGradesMap((prev) => {
        const next = { ...prev };
        PERIODS.forEach((p) => {
          const periodData = { ...(next[p] || {}) };
          mappedStudents.forEach((s) => { if (!periodData[s.id]) periodData[s.id] = EMPTY_GRADE(); });
          next[p] = periodData;
        });
        return next;
      });
      setMaxScoresMap((prev) => {
        const next = { ...prev };
        PERIODS.forEach((p) => {
          const periodData = { ...(next[p] || {}) };
          mappedStudents.forEach((s) => { if (!periodData[s.id]) periodData[s.id] = EMPTY_MAX_SCORE(); });
          next[p] = periodData;
        });
        return next;
      });

      setEntryMap({});
    } catch (error) {
      console.error("Error fetching grade encoding data:", error);
      setCourses([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Grade change ──────────────────────────────────────────────────────────
  const handleGradeChange = (studentId, section, index, value) => {
    setGrades((prev) => {
      const existing = prev[studentId] || EMPTY_GRADE();
      if (section === "midtermExam") {
        return { ...prev, [studentId]: { ...existing, midtermExam: value } };
      }
      const updated = [...existing[section]];
      updated[index] = value;
      return { ...prev, [studentId]: { ...existing, [section]: updated } };
    });
  };

  // ─── Filtering / pagination ────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return students.filter((s) => {
      const matchesCourse = !selectedCourse || String(s.courseId) === String(selectedCourse);
      const matchesSearch =
        !term ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(term) ||
        String(s.studentId).toLowerCase().includes(term);
      return matchesCourse && matchesSearch;
    });
  }, [students, selectedCourse, searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCourse, period, view]);

  const currentStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));

  // ─── Load grade entries ────────────────────────────────────────────────────
  const loadExistingGradeEntries = useCallback(async () => {
    if (!selectedCourse || !activePeriodId || students.length === 0) return;
    try {
      const response = await axios.get(`${API_BASE}/api/grade-entries`, {
        params: { course_id: selectedCourse, period_id: activePeriodId },
      });
      const entries = response.data?.data || [];
      const studentByUserId = new Map(students.filter((s) => s.userId).map((s) => [String(s.userId), s]));

      const grouped = {};
      entries.forEach((entry) => {
        const key = String(entry.student_id);
        if (!grouped[key]) grouped[key] = { assignment: [], quiz: [], exam: [] };
        if (grouped[key][entry.component_type]) grouped[key][entry.component_type].push(entry);
      });

      const nextGrades    = {};
      const nextMaxScores = {};
      const nextEntryMap  = {};

      Object.entries(grouped).forEach(([studentUserId, components]) => {
        const localStudent = studentByUserId.get(studentUserId);
        if (!localStudent) return;

        const assignmentEntries = [...components.assignment].sort((a, b) => {
          const diff = extractComponentOrder(a.component_name) - extractComponentOrder(b.component_name);
          return diff !== 0 ? diff : new Date(a.submitted_at) - new Date(b.submitted_at);
        });
        const quizEntries = [...components.quiz].sort((a, b) => {
          const diff = extractComponentOrder(a.component_name) - extractComponentOrder(b.component_name);
          return diff !== 0 ? diff : new Date(a.submitted_at) - new Date(b.submitted_at);
        });
        const examEntries = [...components.exam].sort((a, b) => {
          const ap = String(a.component_name || "").toLowerCase().includes("midterm") ? 0 : 1;
          const bp = String(b.component_name || "").toLowerCase().includes("midterm") ? 0 : 1;
          return ap !== bp ? ap - bp : new Date(a.submitted_at) - new Date(b.submitted_at);
        });

        const gradeRow = EMPTY_GRADE();
        const maxRow   = EMPTY_MAX_SCORE();

        assignmentEntries.slice(0, 5).forEach((entry, idx) => {
          gradeRow.writtenOutput[idx] = entry.raw_score ?? "";
          maxRow.writtenOutput[idx]   = Number(entry.max_score || 100);
          nextEntryMap[`${localStudent.id}:writtenOutput:${idx}`] = entry.entry_id;
        });
        quizEntries.slice(0, 5).forEach((entry, idx) => {
          gradeRow.performanceTasks[idx] = entry.raw_score ?? "";
          maxRow.performanceTasks[idx]   = Number(entry.max_score || 100);
          nextEntryMap[`${localStudent.id}:performanceTasks:${idx}`] = entry.entry_id;
        });
        if (examEntries.length > 0) {
          gradeRow.midtermExam = examEntries[0].raw_score ?? "";
          maxRow.midtermExam   = Number(examEntries[0].max_score || 100);
          nextEntryMap[`${localStudent.id}:midtermExam`] = examEntries[0].entry_id;
        }

        nextGrades[localStudent.id]    = gradeRow;
        nextMaxScores[localStudent.id] = maxRow;
      });

      if (Object.keys(nextGrades).length > 0)    setGrades((prev)    => ({ ...prev, ...nextGrades }));
      if (Object.keys(nextMaxScores).length > 0) setMaxScores((prev) => ({ ...prev, ...nextMaxScores }));
      setEntryMap(nextEntryMap);
    } catch (error) {
      console.error("Error loading grade entries:", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse, activePeriodId, students, period]);

  const fetchActivityMeta = useCallback(async () => {
    if (!selectedCourse || !activePeriodId) return;
    try {
      const facultyId = Number(localStorage.getItem("userId") || localStorage.getItem("user_id") || 0);
      const response  = await axios.get(`${API_BASE}/api/lms-assignments/faculty`, {
        params: { faculty_id: facultyId, academic_period_id: activePeriodId },
      });
      const assignments = response.data?.assignments || [];
      const courseAssignments = assignments
        .filter((item) => String(item.course_id) === String(selectedCourse))
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

      const nextMeta = EMPTY_ACTIVITY_META();
      let wi = 0, pi = 0;
      courseAssignments.forEach((item) => {
        const type    = String(item.assignment_type || "assignment").toLowerCase();
        const label   = item.title || item.assignment_name || "Activity";
        const maxScore = Number(item.total_points || 100);
        if (type === "quiz")       { if (pi < 5) { nextMeta.performanceTasks[pi++] = { label, maxScore }; } return; }
        if (type === "exam")       { nextMeta.midtermExam = { label, maxScore }; return; }
        if (type === "assignment") { if (wi < 5) { nextMeta.writtenOutput[wi++]    = { label, maxScore }; } }
      });
      setActivityMeta(nextMeta);
    } catch (error) {
      console.error("[GradeEncoding] failed to load activity meta:", error);
      setActivityMeta(EMPTY_ACTIVITY_META());
    }
  }, [selectedCourse, activePeriodId]);

  useEffect(() => { loadExistingGradeEntries(); }, [loadExistingGradeEntries]);
  useEffect(() => { fetchActivityMeta(); },         [fetchActivityMeta]);

  // ─── LMS sync ─────────────────────────────────────────────────────────────
  const syncFromLMS = useCallback(async () => {
    if (!selectedCourse)  { alert("Please select a course before syncing."); return; }
    if (!activePeriodId)  { alert("❌ Error: No active academic period found."); return; }
    try {
      setLoading(true);
      const facultyId = Number(localStorage.getItem("userId") || localStorage.getItem("user_id") || 0);
      const response  = await axios.post(
        `${API_BASE}/api/grade-entries/sync/submissions?course_id=${selectedCourse}&period_id=${activePeriodId}`,
        { submitted_by: facultyId },
      );
      if (response.data?.success) {
        const count = response.data.synced || 0;
        alert(count === 0
          ? "✓ Sync complete: No graded assignments/quizzes found yet."
          : `✅ Synced ${count} graded assignments/quizzes from LMS`);
        await loadExistingGradeEntries();
      } else {
        alert(response.data?.message || "Sync completed but no records were synced");
      }
    } catch (error) {
      console.error("Error syncing from LMS:", error);
      alert(`❌ Sync failed:\n${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, activePeriodId, loadExistingGradeEntries]);

  useEffect(() => {
    if (!selectedCourse || !activePeriodId) return;
    const key = `${selectedCourse}:${activePeriodId}`;
    if (lastAutoSyncRef.current === key) return;
    syncFromLMS().catch(console.error);
    lastAutoSyncRef.current = key;
  }, [selectedCourse, activePeriodId, syncFromLMS]);

  // ─── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedCourse)  { alert("Please select a course before saving."); return; }
    if (!activePeriodId)  { alert("No active academic period found."); return; }
    const facultyId = Number(localStorage.getItem("userId") || localStorage.getItem("user_id") || 0);
    if (!facultyId) { alert("Faculty account not detected. Please log in again."); return; }

    try {
      setLoading(true);
      const requests = [];
      filteredStudents.forEach((student) => {
        if (!student.userId) return;
        const gradeRow = grades[student.id] || EMPTY_GRADE();

        gradeRow.writtenOutput.forEach((score, idx) => {
          const normalized = normalizeNumber(score);
          if (normalized === null) return;
          const payload = {
            student_id: student.userId, course_id: Number(selectedCourse), period_id: Number(activePeriodId),
            component_name: `Written Output ${idx + 1}`, component_type: "assignment",
            raw_score: normalized, max_score: 100,
            weight: Number((CAMPUS_SECTION_WEIGHTS.writtenOutput * (WRITTEN_OUTPUT_ITEM_WEIGHTS[idx] / 100)).toFixed(2)),
            submitted_by: facultyId,
          };
          const existingId = entryMap[`${student.id}:writtenOutput:${idx}`];
          requests.push(existingId
            ? axios.put(`${API_BASE}/api/grade-entries/${existingId}`, payload)
            : axios.post(`${API_BASE}/api/grade-entries`, payload));
        });

        gradeRow.performanceTasks.forEach((score, idx) => {
          const normalized = normalizeNumber(score);
          if (normalized === null) return;
          const payload = {
            student_id: student.userId, course_id: Number(selectedCourse), period_id: Number(activePeriodId),
            component_name: `Performance Task ${idx + 1}`, component_type: "quiz",
            raw_score: normalized, max_score: 100,
            weight: Number((CAMPUS_SECTION_WEIGHTS.performanceTasks * (PERFORMANCE_TASK_ITEM_WEIGHTS[idx] / 100)).toFixed(2)),
            submitted_by: facultyId,
          };
          const existingId = entryMap[`${student.id}:performanceTasks:${idx}`];
          requests.push(existingId
            ? axios.put(`${API_BASE}/api/grade-entries/${existingId}`, payload)
            : axios.post(`${API_BASE}/api/grade-entries`, payload));
        });

        const midterm = normalizeNumber(gradeRow.midtermExam);
        if (midterm !== null) {
          const payload = {
            student_id: student.userId, course_id: Number(selectedCourse), period_id: Number(activePeriodId),
            component_name: "Midterm Exam", component_type: "exam",
            raw_score: midterm, max_score: 100,
            weight: CAMPUS_SECTION_WEIGHTS.midtermExam, submitted_by: facultyId,
          };
          const existingId = entryMap[`${student.id}:midtermExam`];
          requests.push(existingId
            ? axios.put(`${API_BASE}/api/grade-entries/${existingId}`, payload)
            : axios.post(`${API_BASE}/api/grade-entries`, payload));
        }
      });

      if (requests.length === 0) { alert("No grade entries to save."); return; }
      const results = await Promise.allSettled(requests);
      const failed  = results.filter((r) => r.status === "rejected").length;
      alert(failed > 0
        ? `Grades saved with ${failed} failed request(s). Check console for details.`
        : "Grades saved successfully.");
      await loadExistingGradeEntries();
    } catch (error) {
      console.error("Error saving grades:", error);
      alert(error.response?.data?.error || error.message || "Failed to save grades");
    } finally {
      setLoading(false);
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const safeActivityMeta   = activityMeta || EMPTY_ACTIVITY_META();
  const writtenMetaTotal   = safeActivityMeta.writtenOutput.reduce((s, i) => s + Number(i?.maxScore || 0), 0);
  const performanceMetaTotal = safeActivityMeta.performanceTasks.reduce((s, i) => s + Number(i?.maxScore || 0), 0);

  const getCourseName = () => {
    if (!selectedCourse) return "All Courses";
    const course = courses.find((c) => String(c.id) === String(selectedCourse));
    return course ? `${course.code ? `${course.code} - ` : ""}${course.name}` : "Selected Course";
  };

  // ─── Export to Excel (matching UI layout) ─────────────────────────────────
  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // ── Encoding sheet ────────────────────────────────────────────────────
    const encRows = [];

    // Title block
    encRows.push([`GRADE ENCODING SHEET — ${PERIOD_LABELS[period].toUpperCase()}`]);
    encRows.push(["Course:", getCourseName()]);
    encRows.push(["Generated:", new Date().toLocaleString()]);
    encRows.push([]);

    // Header row 1 — group labels
    encRows.push([
      "STUDENT", "ID NUMBER",
      `WRITTEN OUTPUT ${CAMPUS_SECTION_WEIGHTS.writtenOutput}%`, "", "", "", "", "", "", "",
      `PERFORMANCE TASK ${CAMPUS_SECTION_WEIGHTS.performanceTasks}%`, "", "", "", "", "", "", "",
      `${PERIOD_LABELS[period].toUpperCase()} EXAM ${CAMPUS_SECTION_WEIGHTS.midtermExam}%`, "", "",
      "FINAL", "GRADE", "EQUIV.", "STATUS",
    ]);

    // Header row 2 — sub-columns
    encRows.push([
      "", "",
      "1", "2", "3", "4", "5", "Total", "Rating", "%",
      "1", "2", "3", "4", "5", "Total", "Rating", "%",
      "Score", "Rating", "%",
      "", "", "", "",
    ]);

    // Header row 3 — max scores
    encRows.push([
      "", "",
      ...safeActivityMeta.writtenOutput.map((i) => (i ? i.maxScore : "-")),
      writtenMetaTotal || "-", 100, `${CAMPUS_SECTION_WEIGHTS.writtenOutput}%`,
      ...safeActivityMeta.performanceTasks.map((i) => (i ? i.maxScore : "-")),
      performanceMetaTotal || "-", 100, `${CAMPUS_SECTION_WEIGHTS.performanceTasks}%`,
      safeActivityMeta.midtermExam ? safeActivityMeta.midtermExam.maxScore : "-", 100, `${CAMPUS_SECTION_WEIGHTS.midtermExam}%`,
      "", "", "", "",
    ]);

    // Data rows — one per student, matching UI column order exactly
    filteredStudents.forEach((student, rowIdx) => {
      const gradeRow = grades[student.id] || EMPTY_GRADE();
      const maxRow   = maxScores[student.id] || EMPTY_MAX_SCORE();
      const written     = calculateSectionStats(gradeRow.writtenOutput,   maxRow.writtenOutput,   CAMPUS_SECTION_WEIGHTS.writtenOutput);
      const performance = calculateSectionStats(gradeRow.performanceTasks, maxRow.performanceTasks, CAMPUS_SECTION_WEIGHTS.performanceTasks);
      const midtermWeighted = calculateMidtermWeighted(gradeRow.midtermExam, maxRow.midtermExam);
      const finalGrade  = calculateFinalGrade(gradeRow, maxRow);
      const letterInfo  = getLetterInfo(finalGrade);
      const midtermRaw  = normalizeNumber(gradeRow.midtermExam);
      const midtermRating = midtermRaw !== null
        ? ((midtermRaw / (maxRow.midtermExam || 100)) * 100)
        : null;

      encRows.push([
        `${student.lastName}, ${student.firstName}`.trim(),
        student.studentId,
        // Written Output scores
        ...gradeRow.writtenOutput.map((s) => (s === "" ? "" : Number(s))),
        written.totalScore    === null ? "" : written.totalScore,
        written.percent       === null ? "" : written.percent,
        written.weightedScore === null ? "" : written.weightedScore,
        // Performance Task scores
        ...gradeRow.performanceTasks.map((s) => (s === "" ? "" : Number(s))),
        performance.totalScore    === null ? "" : performance.totalScore,
        performance.percent       === null ? "" : performance.percent,
        performance.weightedScore === null ? "" : performance.weightedScore,
        // Exam
        midtermRaw    === null ? "" : midtermRaw,
        midtermRating === null ? "" : Number(midtermRating.toFixed(2)),
        midtermWeighted === null ? "" : midtermWeighted,
        // Summary
        finalGrade === null ? "" : finalGrade,
        letterInfo.letter,
        letterInfo.equivalent,
        letterInfo.status,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(encRows);

    // Column widths
    ws["!cols"] = [
      { wch: 24 }, { wch: 14 },
      ...Array(5).fill({ wch: 8 }), { wch: 8 }, { wch: 8 }, { wch: 8 },
      ...Array(5).fill({ wch: 8 }), { wch: 8 }, { wch: 8 }, { wch: 8 },
      { wch: 8 }, { wch: 8 }, { wch: 8 },
      { wch: 8 }, { wch: 7 }, { wch: 8 }, { wch: 9 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, `${PERIOD_LABELS[period]} Encoding`);

    // ── Grading Report sheet ──────────────────────────────────────────────
    const reportRows = [];
    reportRows.push(["GRADING REPORT"]);
    reportRows.push(["Course:", getCourseName()]);
    reportRows.push(["Period:", PERIOD_LABELS[period]]);
    reportRows.push(["Generated:", new Date().toLocaleString()]);
    reportRows.push([]);
    reportRows.push([
      "#",
      "STUDENT NAME\n(Last Name, First Name Middle Name)",
      "I.D. Number",
      `${PERIOD_LABELS[period]} Grade`,
      "Tentative Final Grade",
      "Final Grade\n(MG + TFG) / 2",
      "Numerical Equivalent",
      "Remarks",
    ]);

    const midtermGrades  = gradesMap["midterm"]  || {};
    const midtermMaxMap  = maxScoresMap["midterm"] || {};

    filteredStudents.forEach((student, i) => {
      const mGradeRow = midtermGrades[student.id]  || EMPTY_GRADE();
      const mMaxRow   = midtermMaxMap[student.id]  || EMPTY_MAX_SCORE();
      const fGradeRow = (gradesMap["final"]   || {})[student.id] || EMPTY_GRADE();
      const fMaxRow   = (maxScoresMap["final"] || {})[student.id] || EMPTY_MAX_SCORE();

      const midtermFinal  = calculateFinalGrade(mGradeRow, mMaxRow);
      const tentativeFinal = calculateFinalGrade(fGradeRow, fMaxRow);

      // Combined final = average of midterm and final period grades
      const combinedFinal = midtermFinal !== null && tentativeFinal !== null
        ? Number(((midtermFinal + tentativeFinal) / 2).toFixed(2))
        : midtermFinal ?? tentativeFinal;

      const numEquiv = getNumericalEquivalent(combinedFinal);
      const remarks  = numEquiv !== null ? (numEquiv <= 4 ? "PASSED" : "FAILED") : "-";

      reportRows.push([
        i + 1,
        `${student.lastName}, ${student.firstName}`.trim().toUpperCase(),
        student.studentId,
        midtermFinal  !== null ? midtermFinal  : "",
        tentativeFinal !== null ? tentativeFinal : 50,   // default 50 if not yet encoded
        combinedFinal !== null ? combinedFinal  : "",
        numEquiv !== null ? numEquiv.toFixed(2) : "",
        remarks,
      ]);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(reportRows);
    ws2["!cols"] = [
      { wch: 4 }, { wch: 34 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, "Grading Report");

    XLSX.writeFile(wb, `Grade_${getCourseName().replace(/\s+/g, "_")}_${PERIOD_LABELS[period]}_${Date.now()}.xlsx`);
  };

  // ─── Import Excel ──────────────────────────────────────────────────────────
  const handleImportExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const data      = await file.arrayBuffer();
      const workbook  = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows      = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      const headerIndex = rows.findIndex((row) => String(row?.[0] || "").toLowerCase() === "student");
      if (headerIndex === -1) throw new Error("Could not find the grade table header in the Excel file");

      const importedGrades = {};
      rows.slice(headerIndex + 2).forEach((row) => {  // skip sub-header rows
        const studentName = row?.[0];
        if (!studentName) return;
        const matchingStudent = filteredStudents.find(
          (s) => `${s.lastName}, ${s.firstName}`.trim().toLowerCase() === String(studentName).toLowerCase()
        );
        if (!matchingStudent) return;
        importedGrades[matchingStudent.id] = {
          writtenOutput:  [row[2], row[3], row[4], row[5], row[6]].map((v) => (v === "" ? "" : v)),
          performanceTasks: [row[10], row[11], row[12], row[13], row[14]].map((v) => (v === "" ? "" : v)),
          midtermExam: row[18] === "" ? "" : row[18],
        };
      });

      setGrades((prev) => ({ ...prev, ...importedGrades }));
      alert("Grades imported successfully.");
    } catch (error) {
      console.error("Error importing Excel file:", error);
      alert(`Failed to import Excel file: ${error.message}`);
    }
  };

  // ─── Grading report data ───────────────────────────────────────────────────
  const getReportRow = (student) => {
    const mGradeRow     = (gradesMap["midterm"]  || {})[student.id] || EMPTY_GRADE();
    const mMaxRow       = (maxScoresMap["midterm"] || {})[student.id] || EMPTY_MAX_SCORE();
    const fGradeRow     = (gradesMap["final"]    || {})[student.id] || EMPTY_GRADE();
    const fMaxRow       = (maxScoresMap["final"]  || {})[student.id] || EMPTY_MAX_SCORE();
    const midtermGrade  = calculateFinalGrade(mGradeRow, mMaxRow);
    const tentativeFinal = calculateFinalGrade(fGradeRow, fMaxRow);
    const combinedFinal = midtermGrade !== null && tentativeFinal !== null
      ? Number(((midtermGrade + tentativeFinal) / 2).toFixed(2))
      : midtermGrade ?? tentativeFinal;
    const numEquiv = getNumericalEquivalent(combinedFinal);
    return { midtermGrade, tentativeFinal, combinedFinal, numEquiv };
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Grade Encoding</h1>
          <p className="text-sm text-slate-500">Campus grading sheet with editable Excel import/export</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users size={16} />
          {filteredStudents.length} students
        </div>
      </div>

      {/* ── Period + View toggles ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Period toggle */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <span className="px-3 py-2 text-xs font-medium text-slate-500 border-r border-slate-200 flex items-center gap-1">
            <BookOpen size={14} /> Period
          </span>
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === p
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setView("encoding")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
              view === "encoding" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <TableProperties size={14} /> Grade Encoding
          </button>
          <button
            type="button"
            onClick={() => setView("report")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-l border-slate-200 ${
              view === "report" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ClipboardList size={14} /> Grading Report
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student ID or name"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code ? `${c.code} - ` : ""}{c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {view === "encoding" && (
            <>
              <button type="button" onClick={() => setGrades({})} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Reset
              </button>
              <button
                type="button"
                onClick={syncFromLMS}
                disabled={loading || !selectedCourse}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={16} /> Sync from LMS
              </button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Upload size={16} /> Import Excel
                <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
              </label>
            </>
          )}
          <button type="button" onClick={handleExportToExcel} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download size={16} /> Export Excel
          </button>
          {view === "encoding" && (
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={16} /> {loading ? "Saving..." : "Save Grades"}
            </button>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/*  VIEW: GRADE ENCODING                                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {view === "encoding" && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[1500px] w-full border-collapse text-xs">
            <thead>
              {/* Row 1 — section group headers */}
              <tr className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <th rowSpan="3" className="border border-slate-200 px-3 py-3 text-left whitespace-nowrap">Student</th>
                <th rowSpan="3" className="border border-slate-200 px-3 py-3 text-left whitespace-nowrap">ID Number</th>
                <th colSpan="8" className="border border-slate-200 px-3 py-2 text-center bg-blue-50">
                  Written Output {CAMPUS_SECTION_WEIGHTS.writtenOutput}%
                </th>
                <th colSpan="8" className="border border-slate-200 px-3 py-2 text-center bg-emerald-50">
                  Performance Task {CAMPUS_SECTION_WEIGHTS.performanceTasks}%
                </th>
                <th colSpan="3" className="border border-slate-200 px-3 py-2 text-center bg-amber-50">
                  {PERIOD_LABELS[period]} Exam {CAMPUS_SECTION_WEIGHTS.midtermExam}%
                </th>
                <th rowSpan="3" className="border border-slate-200 px-3 py-3 text-center bg-violet-50 whitespace-nowrap">Final</th>
                <th rowSpan="3" className="border border-slate-200 px-3 py-3 text-center whitespace-nowrap">Grade</th>
                <th rowSpan="3" className="border border-slate-200 px-3 py-3 text-center whitespace-nowrap">Equiv.</th>
                <th rowSpan="3" className="border border-slate-200 px-3 py-3 text-center whitespace-nowrap">Status</th>
              </tr>

              {/* Row 2 — sub-column labels */}
              <tr className="bg-slate-50 text-xs text-slate-500 text-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <th key={`wh-${n}`} className="border border-slate-200 px-2 py-2">{n}</th>
                ))}
                <th className="border border-slate-200 px-2 py-2 bg-blue-50 whitespace-nowrap">Total</th>
                <th className="border border-slate-200 px-2 py-2 bg-blue-50 whitespace-nowrap">Rating</th>
                <th className="border border-slate-200 px-2 py-2 bg-blue-50 whitespace-nowrap">%</th>
                {[1, 2, 3, 4, 5].map((n) => (
                  <th key={`ph-${n}`} className="border border-slate-200 px-2 py-2">{n}</th>
                ))}
                <th className="border border-slate-200 px-2 py-2 bg-emerald-50 whitespace-nowrap">Total</th>
                <th className="border border-slate-200 px-2 py-2 bg-emerald-50 whitespace-nowrap">Rating</th>
                <th className="border border-slate-200 px-2 py-2 bg-emerald-50 whitespace-nowrap">%</th>
                <th className="border border-slate-200 px-2 py-2 bg-amber-50 whitespace-nowrap">Score</th>
                <th className="border border-slate-200 px-2 py-2 bg-amber-50 whitespace-nowrap">Rating</th>
                <th className="border border-slate-200 px-2 py-2 bg-amber-50 whitespace-nowrap">%</th>
              </tr>

              {/* Row 3 — max score meta row */}
              <tr className="bg-white text-[11px] text-slate-500 text-center">
                {safeActivityMeta.writtenOutput.map((item, i) => (
                  <th key={`wm-${i}`} className="border border-slate-200 px-2 py-1">{item ? item.maxScore : "-"}</th>
                ))}
                <th className="border border-slate-200 px-2 py-1 bg-blue-50 font-semibold">{writtenMetaTotal || "-"}</th>
                <th className="border border-slate-200 px-2 py-1 bg-blue-50 font-semibold">100</th>
                <th className="border border-slate-200 px-2 py-1 bg-blue-50 font-semibold">{CAMPUS_SECTION_WEIGHTS.writtenOutput}%</th>
                {safeActivityMeta.performanceTasks.map((item, i) => (
                  <th key={`pm-${i}`} className="border border-slate-200 px-2 py-1">{item ? item.maxScore : "-"}</th>
                ))}
                <th className="border border-slate-200 px-2 py-1 bg-emerald-50 font-semibold">{performanceMetaTotal || "-"}</th>
                <th className="border border-slate-200 px-2 py-1 bg-emerald-50 font-semibold">100</th>
                <th className="border border-slate-200 px-2 py-1 bg-emerald-50 font-semibold">{CAMPUS_SECTION_WEIGHTS.performanceTasks}%</th>
                <th className="border border-slate-200 px-2 py-1 bg-amber-50 font-semibold">
                  {safeActivityMeta.midtermExam ? safeActivityMeta.midtermExam.maxScore : "-"}
                </th>
                <th className="border border-slate-200 px-2 py-1 bg-amber-50 font-semibold">100</th>
                <th className="border border-slate-200 px-2 py-1 bg-amber-50 font-semibold">{CAMPUS_SECTION_WEIGHTS.midtermExam}%</th>
              </tr>
            </thead>

            <tbody>
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan="26" className="px-4 py-8 text-center text-sm text-slate-500">
                    {loading ? "Loading grade data..." : "No students found"}
                  </td>
                </tr>
              ) : (
                currentStudents.map((student) => {
                  const gradeRow = grades[student.id] || EMPTY_GRADE();
                  const maxRow   = maxScores[student.id] || EMPTY_MAX_SCORE();
                  const written     = calculateSectionStats(gradeRow.writtenOutput,   maxRow.writtenOutput,   CAMPUS_SECTION_WEIGHTS.writtenOutput);
                  const performance = calculateSectionStats(gradeRow.performanceTasks, maxRow.performanceTasks, CAMPUS_SECTION_WEIGHTS.performanceTasks);
                  const midtermWeighted = calculateMidtermWeighted(gradeRow.midtermExam, maxRow.midtermExam);
                  const finalGrade  = calculateFinalGrade(gradeRow, maxRow);
                  const letterInfo  = getLetterInfo(finalGrade);
                  const midtermRaw  = normalizeNumber(gradeRow.midtermExam);

                  return (
                    <tr key={student.id} className="border-t border-slate-200 text-xs hover:bg-slate-50">
                      <td className="border border-slate-200 px-3 py-2 font-medium text-slate-900 whitespace-nowrap">
                        {student.lastName}, {student.firstName}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-600 whitespace-nowrap">{student.studentId}</td>

                      {/* Written Output inputs */}
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <td key={`w-${idx}`} className="border border-slate-200 px-1 py-1 bg-blue-50 text-center">
                          <input
                            type="number" min="0" max="100"
                            value={gradeRow.writtenOutput[idx] ?? ""}
                            onChange={(e) => handleGradeChange(student.id, "writtenOutput", idx, e.target.value)}
                            className="w-14 rounded border border-slate-300 px-1 py-1 text-center text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                          />
                        </td>
                      ))}
                      <td className="border border-slate-200 bg-blue-100 px-2 py-2 text-center font-semibold text-slate-700">
                        {written.totalScore === null ? "-" : written.totalScore.toFixed(2)}
                      </td>
                      <td className="border border-slate-200 bg-blue-100 px-2 py-2 text-center font-semibold text-slate-700">
                        {written.percent === null ? "-" : written.percent.toFixed(2)}
                      </td>
                      <td className="border border-slate-200 bg-blue-100 px-2 py-2 text-center font-semibold text-slate-700">
                        {written.weightedScore === null ? "-" : written.weightedScore.toFixed(2)}
                      </td>

                      {/* Performance Task inputs */}
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <td key={`p-${idx}`} className="border border-slate-200 px-1 py-1 bg-emerald-50 text-center">
                          <input
                            type="number" min="0" max="100"
                            value={gradeRow.performanceTasks[idx] ?? ""}
                            onChange={(e) => handleGradeChange(student.id, "performanceTasks", idx, e.target.value)}
                            className="w-14 rounded border border-slate-300 px-1 py-1 text-center text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                          />
                        </td>
                      ))}
                      <td className="border border-slate-200 bg-emerald-100 px-2 py-2 text-center font-semibold text-slate-700">
                        {performance.totalScore === null ? "-" : performance.totalScore.toFixed(2)}
                      </td>
                      <td className="border border-slate-200 bg-emerald-100 px-2 py-2 text-center font-semibold text-slate-700">
                        {performance.percent === null ? "-" : performance.percent.toFixed(2)}
                      </td>
                      <td className="border border-slate-200 bg-emerald-100 px-2 py-2 text-center font-semibold text-slate-700">
                        {performance.weightedScore === null ? "-" : performance.weightedScore.toFixed(2)}
                      </td>

                      {/* Midterm/Final Exam input */}
                      <td className="border border-slate-200 bg-amber-50 px-1 py-1 text-center">
                        <input
                          type="number" min="0" max="100"
                          value={gradeRow.midtermExam ?? ""}
                          onChange={(e) => handleGradeChange(student.id, "midtermExam", null, e.target.value)}
                          className="w-16 rounded border border-slate-300 px-1 py-1 text-center text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                        />
                      </td>
                      <td className="border border-slate-200 bg-amber-100 px-2 py-2 text-center font-semibold text-slate-700">
                        {midtermRaw === null ? "-" : ((midtermRaw / (maxRow.midtermExam || 100)) * 100).toFixed(2)}
                      </td>
                      <td className="border border-slate-200 bg-amber-100 px-2 py-2 text-center font-semibold text-slate-700">
                        {midtermWeighted === null ? "-" : midtermWeighted.toFixed(2)}
                      </td>

                      {/* Final / Grade / Equiv / Status */}
                      <td className="border border-slate-200 bg-violet-50 px-3 py-2 text-center font-bold text-violet-700">
                        {finalGrade === null ? "-" : finalGrade.toFixed(2)}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-center font-bold text-slate-900">
                        {letterInfo.letter}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-center text-slate-700">
                        {letterInfo.equivalent}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-center">
                        <span className={`rounded px-2 py-1 text-xs font-semibold ${
                          letterInfo.status === "PASSED" ? "bg-green-100 text-green-800" :
                          letterInfo.status === "FAILED" ? "bg-red-100 text-red-800" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {letterInfo.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/*  VIEW: GRADING REPORT                                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {view === "report" && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[900px] w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-white text-xs font-semibold uppercase tracking-wide">
                <th className="border border-slate-600 px-3 py-3 text-center w-10">#</th>
                <th className="border border-slate-600 px-3 py-3 text-left">
                  Student Name
                  <div className="text-[10px] font-normal text-slate-400 normal-case tracking-normal">(Last Name, First Name Middle Name)</div>
                </th>
                <th className="border border-slate-600 px-3 py-3 text-center whitespace-nowrap">I.D. Number</th>
                <th className="border border-slate-600 px-3 py-3 text-center whitespace-nowrap">Midterm Grade</th>
                <th className="border border-slate-600 px-3 py-3 text-center whitespace-nowrap">
                  Tentative Final<br />Grade
                </th>
                <th className="border border-slate-600 px-3 py-3 text-center whitespace-nowrap">
                  Final Grade<br />
                  <span className="text-[10px] font-normal text-slate-400">(MG + TFG) / 2</span>
                </th>
                <th className="border border-slate-600 px-3 py-3 text-center whitespace-nowrap">Numerical<br />Equivalent</th>
                <th className="border border-slate-600 px-3 py-3 text-center whitespace-nowrap">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-sm text-slate-500">
                    {loading ? "Loading..." : "No students found"}
                  </td>
                </tr>
              ) : (
                currentStudents.map((student, i) => {
                  const { midtermGrade, tentativeFinal, combinedFinal, numEquiv } = getReportRow(student);
                  const isPassed = numEquiv !== null && numEquiv <= 4;
                  const isFailed = numEquiv !== null && numEquiv > 4;
                  const rowNum = (currentPage - 1) * itemsPerPage + i + 1;

                  return (
                    <tr key={student.id} className={`border-t border-slate-200 text-xs ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50`}>
                      <td className="border border-slate-200 px-3 py-2 text-center text-slate-500 font-medium">{rowNum}</td>
                      <td className="border border-slate-200 px-3 py-2 font-medium text-slate-900 uppercase">
                        {student.lastName}, {student.firstName}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-center text-slate-700">{student.studentId}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center font-semibold text-slate-800">
                        {midtermGrade !== null ? midtermGrade.toFixed(0) : "-"}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-center font-semibold text-slate-800">
                        {tentativeFinal !== null ? tentativeFinal.toFixed(0) : "50"}
                      </td>
                      <td className={`border border-slate-200 px-3 py-2 text-center font-bold ${
                        isFailed ? "text-red-600" : "text-slate-800"
                      }`}>
                        {combinedFinal !== null ? combinedFinal.toFixed(0) : "-"}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-center font-semibold text-slate-700">
                        {numEquiv !== null ? numEquiv.toFixed(2) : "-"}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-center">
                        <span className={`rounded px-2 py-1 text-xs font-bold border ${
                          isPassed ? "bg-green-50 text-green-700 border-green-300" :
                          isFailed ? "bg-red-50 text-red-700 border-red-300" :
                          "bg-slate-100 text-slate-500 border-slate-300"
                        }`}>
                          {numEquiv !== null ? (isPassed ? "PASSED" : "FAILED") : "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <div>
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredStudents.length)}–
          {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="px-2 font-medium text-slate-900">{currentPage}</span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1 rounded border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradeEncoding;