import { toast } from "react-toastify";
import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Link,
  Plus,
  BookOpen,
  AlertCircle,
  Trash2,
  X,
} from "lucide-react";
import Select from "react-select";
import axios from "axios";

const Prerequisites = () => {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseLoadError, setCourseLoadError] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterYearLevel, setFilterYearLevel] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [prerequisites, setPrerequisites] = useState([]);
  const [loadingPrerequisites, setLoadingPrerequisites] = useState(false);
  const [prereqForm, setPrereqForm] = useState({
    course: [], // support multiple selected prerequisite courses
    isCorequisite: false,
    error: "",
  });

  // Fetch all courses
  const fetchCourses = async () => {
    setLoadingCourses(true);
    setCourseLoadError(false);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/course/courses`
      );
      setCourses(res.data);
      if (res.data.length > 0 && !selectedCourse) {
        setSelectedCourse(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setCourseLoadError(true);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Fetch prerequisites for selected course
  const fetchPrerequisites = async (courseId) => {
    setLoadingPrerequisites(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/prerequisites/course/${courseId}`
      );
      setPrerequisites(res.data);
    } catch (err) {
      console.error("Failed to fetch prerequisites:", err);
      setPrerequisites([]);
    } finally {
      setLoadingPrerequisites(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchPrerequisites(selectedCourse.id);
    }
  }, [selectedCourse]);

  const filteredCourses = useMemo(() => {
    return courses
      .filter(
        (course) =>
          ((course.code || "").toLowerCase().includes(courseSearch.toLowerCase()) ||
            (course.title || "").toLowerCase().includes(courseSearch.toLowerCase())) &&
          (!filterDepartment || String(course.department_id || "") === filterDepartment) &&
          (!filterYearLevel || course.year_level === filterYearLevel)
      )
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [courses, courseSearch, filterDepartment, filterYearLevel]);

  const departmentOptions = useMemo(() => {
    const departments = new Map();
    courses.forEach((course) => {
      if (course.department_id && course.department_name) {
        departments.set(String(course.department_id), course.department_name);
      }
    });
    return [...departments.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [courses]);

  const courseOptions = useMemo(() => {
    // build a set of already assigned prerequisite course IDs to exclude
    const excluded = new Set(
      (prerequisites || []).map((p) => p.prereq_course_id)
    );

    return courses
      .filter((c) => c.id !== selectedCourse?.id && !excluded.has(c.id))
      .map((course) => ({
        value: course.id,
        label: `${course.code} - ${course.title}`,
      }));
  }, [courses, selectedCourse, prerequisites]);

  const handlePrereqFormChange = (key, value) => {
    let newError = "";

    if (key === "course") {
      // value may be null, a single object, or an array when isMulti is used
      if (!value) {
        value = [];
      }

      // normalize to array
      const selected = Array.isArray(value) ? value : [value];

      // prevent selecting the same course as itself
      if (selected.some((v) => v.value === selectedCourse?.id)) {
        newError = `${selectedCourse.code} cannot be its own prerequisite.`;
        // remove any illegal selection
        value = selected.filter((v) => v.value !== selectedCourse?.id);
      } else {
        value = selected;
      }
    }

    setPrereqForm((prev) => ({ ...prev, [key]: value, error: newError }));
  };

  const handleAddPrerequisite = async () => {
    if (!prereqForm.course || prereqForm.course.length === 0) {
      toast.warning("Please select at least one course to add as a prerequisite.");
      return;
    }
    const results = { created: [], skipped: [], errors: [] };

    for (const sel of prereqForm.course) {
      try {
        const payload = {
          course_id: selectedCourse.id,
          prereq_course_id: sel.value,
          // if per-item flag exists use it, otherwise fallback to global
          is_corequisite:
            typeof sel.is_corequisite !== "undefined"
              ? sel.is_corequisite
              : !!prereqForm.isCorequisite,
        };

        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/prerequisites`,
          payload
        );
        results.created.push(res.data);
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message;
        // Treat duplicate existence as a non-fatal skip (service returns "This prerequisite already exists")
        if (msg && msg.toString().toLowerCase().includes("already exists")) {
          results.skipped.push({ id: sel.value, message: msg });
        } else {
          results.errors.push({ id: sel.value, message: msg });
        }
      }
    }

    // Reset form and refresh
    setPrereqForm({ course: [], isCorequisite: false, error: "" });
    fetchPrerequisites(selectedCourse.id);

    // Summarize results
    if (results.errors.length > 0) {
      console.error("Some prerequisites failed:", results.errors);
      toast.error(`Completed with errors. Created: ${results.created.length}, Skipped: ${results.skipped.length}, Errors: ${results.errors.length}`);
    } else {
      toast.info(`Done. Created: ${results.created.length}, Skipped: ${results.skipped.length}`);
    }
  };

  const handleDeletePrerequisite = async (prereqId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/prerequisites/${prereqId}`
      );
      fetchPrerequisites(selectedCourse.id);
      toast.success("Prerequisite deleted successfully!");
    } catch (err) {
      console.error("Failed to delete prerequisite:", err);
      toast.error(err.response?.data?.message || "Failed to delete prerequisite");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggleCorequisite = async (prereq) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/prerequisites/${prereq.id}`,
        {
          course_id: prereq.course_id,
          prereq_course_id: prereq.prereq_course_id,
          is_corequisite: !prereq.is_corequisite,
        }
      );
      fetchPrerequisites(selectedCourse.id);
    } catch (err) {
      console.error("Failed to update prerequisite:", err);
      toast.error(err.response?.data?.message || "Failed to update prerequisite");
    }
  };

  if (!selectedCourse) {
    if (!loadingCourses && courseLoadError) {
      return (
        <div className="p-4">
          <h1 className="mb-2 text-xl font-bold">Course Prerequisites Management</h1>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="mb-3 text-sm text-red-700">Could not load courses.</p>
            <button
              type="button"
              onClick={fetchCourses}
              className="rounded-md border border-indigo-300 bg-white px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-50"
            >Try again</button>
          </div>
        </div>
      );
    }

    if (!loadingCourses) {
      return (
        <div className="p-4">
          <h1 className="mb-2 text-xl font-bold">Course Prerequisites Management</h1>
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No courses available. Add a course first to configure prerequisites.
          </div>
        </div>
      );
    }

    return (
      <div className="p-4" aria-busy="true">
        <div className="mb-2 h-7 w-72 max-w-full animate-pulse rounded bg-slate-200" />
        <div className="mb-4 h-4 w-[34rem] max-w-full animate-pulse rounded bg-slate-100" />
        <div className="flex flex-col gap-4 lg:flex-row">
          <section className="w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:w-1/3">
            <div className="mb-3 h-5 w-36 animate-pulse rounded bg-slate-200" />
            <div className="mb-3 h-9 animate-pulse rounded bg-slate-100" />
            <div className="mb-2 grid grid-cols-2 gap-2">
              <div className="h-9 animate-pulse rounded bg-slate-100" />
              <div className="h-9 animate-pulse rounded bg-slate-100" />
            </div>
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="mb-2 rounded-md border border-slate-100 p-2">
                <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </section>
          <section className="w-full space-y-4 lg:w-2/3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 h-5 w-64 max-w-full animate-pulse rounded bg-slate-200" />
              {[0, 1, 2].map((row) => (
                <div key={row} className="mb-2 flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div className="w-2/3">
                    <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
                  </div>
                  <div className="h-8 w-24 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 h-5 w-44 animate-pulse rounded bg-slate-200" />
              <div className="mb-4 h-10 animate-pulse rounded bg-slate-100" />
              <div className="mb-4 h-4 w-56 animate-pulse rounded bg-slate-100" />
              <div className="h-9 w-40 animate-pulse rounded bg-indigo-100" />
            </div>
          </section>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500" role="status" aria-live="polite">
          <span className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 align-[-2px]" />
          Loading courses…
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">
        Course Prerequisites Management
      </h1>
      <p className="text-sm text-slate-600 mb-4">
        Define course dependencies and prerequisites. Select a course from the
        left panel to manage its requirements.
      </p>

      <div className="flex gap-4">
        {/* Left Column - Course List */}
        <div className="w-1/3 bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
          <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <BookOpen size={16} />
            Select a Course
          </h2>

          <div className="relative mb-2">
            <Search
              size={16}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search courses..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="w-full pl-8 pr-2 py-2 border border-slate-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="min-w-0 px-2 py-2 border border-slate-300 rounded text-xs bg-white"
              aria-label="Filter courses by department"
            >
              <option value="">All Departments</option>
              {departmentOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <select
              value={filterYearLevel}
              onChange={(e) => setFilterYearLevel(e.target.value)}
              className="min-w-0 px-2 py-2 border border-slate-300 rounded text-xs bg-white"
              aria-label="Filter courses by year level"
            >
              <option value="">All Years</option>
              {["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`p-2 rounded cursor-pointer transition text-sm ${
                  selectedCourse?.id === course.id
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500 font-semibold"
                    : "hover:bg-slate-100 text-slate-800"
                }`}
              >
                <div className="font-semibold">{course.code} <span className="font-normal">— {course.title}</span></div>
                <div className="text-xs text-slate-500">
                  {course.department_name || "No department"} · {course.year_level || "Year not assigned"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Prerequisites Management */}
        <div className="w-2/3 space-y-4">
          {/* Current Prerequisites */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Link size={18} />
              Prerequisites for: {selectedCourse.code} - {selectedCourse.title}
            </h2>

            {loadingPrerequisites ? (
              <div aria-busy="true" role="status" aria-live="polite" className="space-y-2">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div className="w-2/3">
                      <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                      <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
                    </div>
                    <div className="h-8 w-24 animate-pulse rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : prerequisites.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded bg-slate-50">
                <Link size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-slate-600 text-sm">
                  No prerequisites defined for this course.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Use the form below to add one.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {prerequisites.map((prereq) => (
                  <div
                    key={prereq.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {prereq.prereq_code} - {prereq.prereq_title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            prereq.is_corequisite
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {prereq.is_corequisite
                            ? "Co-requisite"
                            : "Pre-requisite"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCorequisite(prereq)}
                        className="px-3 py-1 text-xs border border-slate-300 rounded hover:bg-slate-100 transition"
                        title="Toggle prerequisite/corequisite"
                      >
                        Toggle Type
                      </button>
                      <button
                        onClick={() => setDeleteTarget(prereq)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete prerequisite"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Prerequisite Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Plus size={16} />
              Add New Prerequisite
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">
                Select Course *
              </label>
              <Select
                options={courseOptions}
                placeholder="Search and select a course..."
                isMulti
                value={prereqForm.course}
                onChange={(selected) =>
                  handlePrereqFormChange("course", selected)
                }
                classNamePrefix="select"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "38px",
                  }),
                }}
              />
            </div>

            {prereqForm.error && (
              <div className="flex items-start p-2 text-sm bg-red-100 text-red-800 rounded border border-red-300">
                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{prereqForm.error}</span>
              </div>
            )}

            <div className="flex items-center pt-2">
              <input
                id="co-requisite-checkbox"
                type="checkbox"
                checked={prereqForm.isCorequisite}
                onChange={(e) =>
                  handlePrereqFormChange("isCorequisite", e.target.checked)
                }
                className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="co-requisite-checkbox"
                className="ml-2 text-sm text-slate-700"
              >
                Mark as Co-requisite (can be taken concurrently)
              </label>
            </div>

            <button
              onClick={handleAddPrerequisite}
              disabled={!prereqForm.course || prereqForm.course.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition"
            >
              <Plus size={16} /> Add Prerequisite
            </button>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-prerequisite-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-prerequisite-title" className="mb-2 text-lg font-semibold text-slate-900">
              Delete prerequisite?
            </h2>
            <p className="mb-5 text-sm text-slate-600">
              Remove <strong>{deleteTarget.prereq_code} — {deleteTarget.prereq_title}</strong> as a prerequisite for <strong>{selectedCourse.code}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >Cancel</button>
              <button
                type="button"
                onClick={() => handleDeletePrerequisite(deleteTarget.id)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prerequisites;
