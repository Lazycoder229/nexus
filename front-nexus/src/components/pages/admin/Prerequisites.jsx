import React, { useState, useMemo } from "react";
import { Search, Link, Plus, BookOpen, AlertCircle } from "lucide-react";
import Select from "react-select";

const mockCourses = [
  {
    code: "CS101",
    title: "Introduction to Programming",
    dept: "CS",
    level: 100,
  },
  { code: "CS201", title: "Data Structures", dept: "CS", level: 200 },
  { code: "MA101", title: "Calculus I", dept: "MA", level: 100 },
  { code: "PH101", title: "Physics for Engineers", dept: "PH", level: 100 },
  { code: "EN101", title: "English Composition", dept: "EN", level: 100 },
  { code: "CS301", title: "Algorithms & Complexity", dept: "CS", level: 300 },
  { code: "DB202", title: "Database Systems", dept: "DB", level: 200 },
  { code: "NT401", title: "Computer Networks", dept: "NT", level: 400 },
];

const courseOptions = mockCourses.map((course) => ({
  value: course.code,
  label: `${course.code} - ${course.title}`,
}));

const gradeOptions = [
  { value: "None", label: "None" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
];

const Prerequisites = () => {
  const [selectedCourse, setSelectedCourse] = useState(mockCourses[0]);
  const [courseSearch, setCourseSearch] = useState("");
  const [prereqForm, setPrereqForm] = useState({
    course: null,
    minimumGrade: "None",
    isCorequisite: false,
    error: "",
  });

  const filteredCourses = useMemo(() => {
    return mockCourses
      .filter(
        (course) =>
          course.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
          course.title.toLowerCase().includes(courseSearch.toLowerCase())
      )
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [courseSearch]);

  const handlePrereqFormChange = (key, value) => {
    let newError = "";
    if (key === "course" && value && value.value === selectedCourse.code) {
      newError = `${selectedCourse.code} cannot be its own prerequisite.`;
      value = null;
    }
    setPrereqForm((prev) => ({ ...prev, [key]: value, error: newError }));
  };

  const handleAddPrerequisite = () => {
    if (prereqForm.course) {
      alert(
        `Adding Prerequisite: ${prereqForm.course.value} with minimum grade ${
          prereqForm.minimumGrade
        } as a ${
          prereqForm.isCorequisite ? "Co-requisite" : "Pre-requisite"
        } for ${selectedCourse.code}.`
      );
      setPrereqForm({
        course: null,
        minimumGrade: "None",
        isCorequisite: false,
        error: "",
      });
    } else {
      alert("Please select a course to add as a prerequisite.");
    }
  };

  return (
    <div className="p-2">
      <h1 className="text-lg font-bold mb-2">Pre-requisite Setup</h1>
      <p className="text-xs text-slate-600 mb-4">
        Define dependencies and pre-requisites between subjects. Select a course
        from the left panel to manage its requirements on the right.
      </p>

      <div className="flex gap-4">
        {/* Left Column */}
        <div className="w-1/3 bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
          <h2 className="text-sm font-semibold mb-2">Select a Course</h2>

          <div className="relative mb-2">
            <Search
              size={16}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="w-full pl-8 pr-2 py-1 border border-slate-300 rounded text-xs focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
            {filteredCourses.map((course) => (
              <div
                key={course.code}
                onClick={() => setSelectedCourse(course)}
                className={`p-2 rounded cursor-pointer transition text-xs ${
                  selectedCourse.code === course.code
                    ? "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-500 font-semibold"
                    : "hover:bg-slate-100 text-slate-800"
                }`}
              >
                <div className="font-semibold">{course.code}</div>
                <div>{course.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-2/3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-sm font-bold mb-2">
              Managing Prerequisites for: {selectedCourse.code} -{" "}
              {selectedCourse.title}
            </h2>

            <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded bg-slate-50">
              <Link size={32} className="mx-auto text-slate-400 mb-1" />
              <p className="text-slate-600 text-xs">
                No prerequisites defined for this course.
              </p>
              <p className="text-xs text-slate-500">
                Use the form below to add one.
              </p>
            </div>
          </div>

          {/* Add Prereq Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2">
            <h3 className="text-sm font-semibold mb-2">
              Add New Pre-requisite
            </h3>

            <div>
              <label className="block text-xs font-medium mb-1">Course</label>
              <Select
                options={courseOptions}
                placeholder="Search course..."
                value={prereqForm.course}
                onChange={(selected) =>
                  handlePrereqFormChange("course", selected)
                }
                classNamePrefix="select"
                isDisabled={prereqForm.error.includes(selectedCourse.code)}
              />
            </div>

            {prereqForm.error && (
              <div className="flex items-start p-2 text-xs bg-red-100 text-red-800 rounded border border-red-300">
                <AlertCircle size={16} className="mr-1 mt-0.5" />
                <span>{prereqForm.error}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="w-1/2">
                <label className="block text-xs font-medium mb-1">
                  Minimum Grade
                </label>
                <Select
                  options={gradeOptions}
                  value={gradeOptions.find(
                    (opt) => opt.value === prereqForm.minimumGrade
                  )}
                  onChange={(selected) =>
                    handlePrereqFormChange("minimumGrade", selected.value)
                  }
                  classNamePrefix="select"
                />
              </div>

              <div className="w-1/2 flex items-center pt-2">
                <input
                  id="co-requisite-checkbox"
                  type="checkbox"
                  checked={prereqForm.isCorequisite}
                  onChange={(e) =>
                    handlePrereqFormChange("isCorequisite", e.target.checked)
                  }
                  className="h-3 w-3 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor="co-requisite-checkbox"
                  className="ml-1 text-xs text-slate-700"
                >
                  Mark as Co-requisite
                </label>
              </div>
            </div>

            <button
              onClick={handleAddPrerequisite}
              disabled={!prereqForm.course}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              <Plus size={14} /> Add Pre-requisite
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => alert("Cancel action triggered.")}
              className="px-4 py-1 text-xs bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={() => alert("Save Changes action triggered.")}
              className="px-4 py-1 text-xs bg-slate-800 text-white rounded hover:bg-slate-900"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prerequisites;
