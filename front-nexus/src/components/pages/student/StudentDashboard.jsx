import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  Users,
  Bell,
  FileText,
  GraduationCap,
  DollarSign,
} from "lucide-react";

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch from real backend endpoints
      const [
        enrollmentsRes,
        gradesRes,
        attendanceRes,
        announcementsRes,
        invoicesRes,
        scholarshipRes,
      ] = await Promise.all([
        api.get(`/api/enrollments`),
        api.get(`/api/grades`),
        api.get(`/api/student-attendance`),
        api.get(`/api/events/announcements`),
        api.get(`/api/invoices`),
        api.get(
          `/api/scholarships/student/${localStorage.getItem("userId") || 0}`,
        ),
      ]);

      // Aggregate dashboard data from real endpoints
      const enrollments = Array.isArray(enrollmentsRes.data)
        ? enrollmentsRes.data
        : enrollmentsRes.data?.data || [];
      const grades = Array.isArray(gradesRes.data)
        ? gradesRes.data
        : gradesRes.data?.data || [];
      const attendance = Array.isArray(attendanceRes.data)
        ? attendanceRes.data
        : attendanceRes.data?.data || [];
      const announcementsData = announcementsRes.data || [];
      const invoices = invoicesRes.data || [];
      const scholarships = scholarshipRes.data.data || [];

      // Calculate dashboard summary
      const totalPresent = attendance.filter(
        (a) => a.status === "present",
      ).length;
      const totalRecords = attendance.length || 1;
      const attendanceRate = Math.round((totalPresent / totalRecords) * 100);

      // Find active grant for scholarship deduction
      const activeGrant = scholarships.find(
        (s) => s.status === "Approved" || s.status === "Active",
      );
      let scholarshipDeduction = 0;
      if (activeGrant) {
        if (activeGrant.discount_type === "Percentage") {
          // We'd need tuition fee setup to be exact, but for dashboard let's use a simpler heuristic or just show the grant info
          // For now, let's keep it simple: if percentage, we might need another fetch or just show fixed deduction if present
          scholarshipDeduction = 0; // Placeholder until tuition fees are fetched here too, or just subtract fixed allowance
        } else {
          scholarshipDeduction = parseFloat(activeGrant.discount_value) || 0;
        }
      }

      const pendingBalance = invoices
        .filter((inv) => inv.status === "pending" || inv.status === "unpaid")
        .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

      const finalBalance = Math.max(0, pendingBalance - scholarshipDeduction);

      setDashboardData({
        enrolled_subjects: enrollments.length,
        current_gpa:
          grades.length > 0
            ? (
                grades.reduce((sum, g) => sum + (parseFloat(g.grade) || 0), 0) /
                grades.length
              ).toFixed(2)
            : "0.00",
        attendance_rate: attendanceRate,
        pending_balance: finalBalance.toLocaleString(),
        pending_assignments: 0,
        upcoming_exams: 0,
        completed_units: enrollments.reduce(
          (sum, e) => sum + (e.units || 0),
          0,
        ),
      });

      // Set recent grades
      setRecentGrades(
        grades.slice(0, 5).map((g) => ({
          subject: g.course_name || g.subject_name || "N/A",
          assessment: g.assessment_type || "Final",
          grade: g.grade || g.final_grade || "N/A",
        })),
      );

      // Set announcements
      setAnnouncements(
        announcementsData.slice(0, 5).map((a) => ({
          title: a.title,
          message: a.content || a.message,
          date: new Date(a.created_at).toLocaleDateString(),
        })),
      );

      // Set upcoming classes (from enrollments/schedules)
      setUpcomingClasses(
        enrollments.slice(0, 3).map((e) => ({
          subject_name: e.course_name || e.subject_name || "N/A",
          room: e.room || "TBA",
          instructor: e.instructor_name || "TBA",
          time: e.schedule || "TBA",
          duration: e.duration || "2 hours",
        })),
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard size={24} className="text-indigo-600" />
            Student Dashboard
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-100 uppercase mb-1">
                  Enrolled Subjects
                </p>
                <p className="text-3xl font-bold">
                  {dashboardData?.enrolled_subjects || 0}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <BookOpen className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-100 uppercase mb-1">
                  Current GPA
                </p>
                <p className="text-3xl font-bold">
                  {dashboardData?.current_gpa || "0.00"}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingUp className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-100 uppercase mb-1">
                  Attendance Rate
                </p>
                <p className="text-3xl font-bold">
                  {dashboardData?.attendance_rate || 0}%
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-100 uppercase mb-1">
                  Pending Balance
                </p>
                <p className="text-3xl font-bold">
                  ₱{dashboardData?.pending_balance || 0}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <DollarSign className="text-white" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Upcoming Classes & Recent Grades */}
          <div className="lg:col-span-2 space-y-4">
            {/* Upcoming Classes */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-indigo-600" />
                Today's Classes
              </h3>
              <div className="space-y-3">
                {upcomingClasses.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                    No classes today
                  </p>
                ) : (
                  upcomingClasses.map((classItem, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                          <Clock
                            size={18}
                            className="text-indigo-600 dark:text-indigo-400"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {classItem.subject_name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {classItem.room} • {classItem.instructor}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {classItem.time}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {classItem.duration}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Grades */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-green-600" />
                Recent Grades
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead>
                    <tr className="text-left text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                      <th className="pb-2">Subject</th>
                      <th className="pb-2">Assessment</th>
                      <th className="pb-2 text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {recentGrades.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-4 text-center text-slate-500 dark:text-slate-400"
                        >
                          No recent grades
                        </td>
                      </tr>
                    ) : (
                      recentGrades.map((grade, index) => (
                        <tr key={index} className="text-sm">
                          <td className="py-2 font-medium text-slate-900 dark:text-white">
                            {grade.subject}
                          </td>
                          <td className="py-2 text-slate-600 dark:text-slate-400">
                            {grade.assessment}
                          </td>
                          <td className="py-2 text-right">
                            <span className="font-bold text-green-600 dark:text-green-400">
                              {grade.grade}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Announcements & Quick Links */}
          <div className="space-y-4">
            {/* Announcements */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell size={20} className="text-orange-600" />
                Announcements
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {announcements.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                    No announcements
                  </p>
                ) : (
                  announcements.map((announcement, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle
                          size={16}
                          className="text-orange-500 mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">
                            {announcement.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {announcement.message}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {announcement.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Pending Assignments
                  </span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {dashboardData?.pending_assignments || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Upcoming Exams
                  </span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {dashboardData?.upcoming_exams || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Completed Units
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {dashboardData?.completed_units || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
