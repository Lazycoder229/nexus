import { useState, useEffect } from "react";
import { BookOpen, Play, FileText, Download, Clock, Eye, Upload, CheckCircle, AlertCircle, Calendar as CalendarIcon, Send } from "lucide-react";

const StudentLMS = () => {
  const [activeTab, setActiveTab] = useState("lessons");
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "lessons") {
        await fetchLessons();
      } else if (activeTab === "quizzes") {
        await fetchQuizzes();
      } else if (activeTab === "assignments") {
        await fetchAssignments();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/student/lms/lessons");
      const data = await response.json();
      if (data.success) setLessons(data.data);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/student/lms/quizzes");
      const data = await response.json();
      if (data.success) setQuizzes(data.data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/student/lms/assignments");
      const data = await response.json();
      if (data.success) setAssignments(data.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const groupedLessons = lessons.reduce((acc, lesson) => {
    const subject = lesson.subject_name || "General";
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(lesson);
    return acc;
  }, {});

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      missed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      submitted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      late: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      graded: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return colors[status] || colors.pending;
  };

  const tabs = [
    { id: "lessons", label: "View Lessons", icon: BookOpen },
    { id: "quizzes", label: "Quizzes", icon: FileText },
    { id: "assignments", label: "Assignments", icon: FileText },
  ];

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen size={24} className="text-indigo-600" />
            Learning Management System
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Online Learning Platform
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-0 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Lessons Tab */}
        {activeTab === "lessons" && (
          <div className="space-y-4">
            {Object.entries(groupedLessons).length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
                <BookOpen size={48} className="mx-auto text-slate-400 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No learning materials available yet</p>
              </div>
            ) : (
              Object.entries(groupedLessons).map(([subject, subjectLessons]) => (
                <div key={subject} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{subject}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subjectLessons.map((lesson) => (
                      <div
                        key={lesson.lesson_id}
                        className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {lesson.type === "video" ? (
                              <Play size={18} className="text-indigo-600" />
                            ) : (
                              <FileText size={18} className="text-indigo-600" />
                            )}
                            <h4 className="font-semibold text-slate-900 dark:text-white">{lesson.title}</h4>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{lesson.description}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {lesson.duration || "30 min"}
                          </span>
                          <span>{new Date(lesson.uploaded_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedLesson(lesson)}
                            className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md font-medium text-sm transition-colors"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          {lesson.file_url && (
                            <button className="flex items-center justify-center gap-1 bg-slate-600 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md font-medium text-sm transition-colors">
                              <Download size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === "quizzes" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {quizzes.length === 0 ? (
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
                <FileText size={48} className="mx-auto text-slate-400 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No quizzes available</p>
              </div>
            ) : (
              quizzes.map((quiz) => (
                <div
                  key={quiz.quiz_id}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{quiz.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{quiz.subject_name}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(quiz.status)}`}>
                      {quiz.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{quiz.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon size={16} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Due Date</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {new Date(quiz.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Time Limit</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{quiz.time_limit || "30"} mins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText size={16} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Questions</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{quiz.total_questions || 20}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle size={16} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Score</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {quiz.score ? `${quiz.score}/${quiz.max_score}` : "Not taken"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {quiz.status === "pending" && (
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
                      Take Quiz
                    </button>
                  )}
                  {quiz.status === "completed" && (
                    <button className="w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
                      View Results
                    </button>
                  )}
                  {quiz.status === "missed" && (
                    <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle size={16} />
                      Quiz deadline has passed
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="space-y-3">
            {assignments.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
                <FileText size={48} className="mx-auto text-slate-400 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No assignments available</p>
              </div>
            ) : (
              assignments.map((assignment) => (
                <div
                  key={assignment.assignment_id}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{assignment.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{assignment.subject_name}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{assignment.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon size={16} className="text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Due Date</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {new Date(assignment.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Posted</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {new Date(assignment.posted_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {assignment.score !== null && (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Score</p>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {assignment.score}/{assignment.max_score}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2">
                      {assignment.status === "pending" && (
                        <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap">
                          <Upload size={14} />
                          Submit
                        </button>
                      )}
                      {assignment.status === "submitted" && (
                        <button className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap">
                          <FileText size={14} />
                          View Submission
                        </button>
                      )}
                      {assignment.status === "graded" && (
                        <button className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap">
                          <CheckCircle size={14} />
                          View Grade
                        </button>
                      )}
                      {assignment.status === "late" && (
                        <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400 text-sm px-4 py-2">
                          <AlertCircle size={16} />
                          Late Submission
                        </div>
                      )}
                    </div>
                  </div>

                  {assignment.submitted_at && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Submitted on {new Date(assignment.submitted_at).toLocaleString()}
                      </p>
                      {assignment.feedback && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                          <strong>Feedback:</strong> {assignment.feedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLMS;
