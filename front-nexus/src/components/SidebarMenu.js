import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Calendar,
  MapPin,
  GraduationCap,
  Lock,
  Book,
  ClipboardList,
  DollarSign,
  FileText as ReportIcon,
  Award,
  CheckSquare,
  Mail,
  Bell,
  MessageCircle,
  CalendarCheck,
  Home,
  Circle,
  Settings,
} from "lucide-react";

const Menu = {
  Admin: [
    { title: "Dashboard", path: "/admin/dashboard", icons: LayoutDashboard },
    {
      title: "Department & Course Mngt",
      icons: Users,
      submenu: [
        {
          label: "Department Management",
          icons: Users,
          link: "/admin/admin_department_managent",
        },
        {
          label: "Course Management",
          icons: BookOpen,
          link: "/admin/admin_course_management",
        },
        {
          label: "Pre-requisite Setup",
          icons: FileText,
          link: "/admin/admin_prerequisite",
        },
        {
          label: "Program Offerings",
          icons: GraduationCap,
          link: "/admin/admin_program_offerings",
        },
        {
          label: "Academic Year & Semester Mngt",
          icons: Calendar,
          link: "/admin/admin_academic_year",
        },
      ],
    },
    {
      title: "Student Managemnet",
      icons: Users,
      submenu: [
        {
          label: "Manage Student",
          icons: Users,
          link: "/admin/admin_student_management",
        },
        { label: "Admission", icons: FileText, link: "/admin/admin_admission" },
        {
          label: "Enrollment Records",
          icons: ClipboardList,
          link: "/admin/admin_enrollment",
        },
        {
          label: "Course Transfer & Shifting",
          icons: FileText,
          link: "/admin/admin_course_transfer",
        },
        {
          label: "Academic History",
          icons: CalendarCheck,
          link: "/admin/admin_academic_history",
        },
        {
          label: "ID Generator",
          icons: FileText,
          link: "/admin/admin_id_generator",
        },
        {
          label: "Clearance Processing",
          icons: CheckSquare,
          link: "/admin/admin_clearance_processing",
        },
      ],
    },
    {
      title: "Faculty Management",
      icons: GraduationCap,
      submenu: [
        {
          label: "Faculty Management",
          icons: Users,
          link: "/admin/admin_faculty_management",
        },
        {
          label: "Assign Courses",
          icons: BookOpen,
          link: "/admin/admin_faculty_assign_course",
        },
        {
          label: "Advisory Assignments",
          icons: ClipboardList,
          link: "/admin/admin_faculty_advisory_assignment",
        },
        {
          label: "Faculty Evaluation",
          icons: CheckSquare,
          link: "/admin/admin_faculty_evaluation",
        },
        {
          label: "Faculty Scheduling",
          icons: Calendar,
          link: "/admin/admin_faculty_scheduling",
        },
      ],
    },
    {
      title: "Academic Management",
      icons: BookOpen,
      submenu: [
        {
          label: "Subject & Sections",
          icons: BookOpen,
          link: "/admin/admin_subject_sections",
        },
        {
          label: "Timetable Builder",
          icons: CalendarCheck,
          link: "/admin/admin_timetable",
        },
        {
          label: "Academic Calendar",
          icons: Calendar,
          link: "/admin/admin_academic_calendar",
        },
        {
          label: "Class Capacity Monitor",
          icons: Users,
          link: "/admin/admin_capacity_monitor",
        },
        {
          label: "Grade Management",
          icons: CheckSquare,
          link: "/admin/admin_grademanagement",
        },
        {
          label: "Syllabus Repository",
          icons: Book,
          link: "/admin/admin_syllabus_repository",
        },
      ],
    },
    {
      title: "Attendance Management",
      icons: CalendarCheck,
      submenu: [
        {
          label: "Staff Attendance",
          icons: Users,
          link: "/admin/admin_staff_attendance",
        },
        {
          label: "Student Management",
          icons: Users,
          link: "/admin/admin_student_attendance",
        },
        {
          label: "RFID Integration",
          icons: Circle,
          link: "/admin/admin_rfid_integration",
        },
        {
          label: "Absentee Alerts",
          icons: Bell,
          link: "/admin/admin_absentee",
        },
      ],
    },
    {
      title: "Examination & Grading",
      icons: FileText,
      submenu: [
        {
          label: "Exam Setup",
          icons: FileText,
          link: "/admin/admin_exam_setup",
        },
        {
          label: "Grade Entry Approval",
          icons: CheckSquare,
          link: "/admin/admin_grade_entry",
        },
        {
          label: "Grade Computation Setup",
          icons: FileText,
          link: "/admin/admin_grade_computation",
        },
        {
          label: "Exam Schedule Builder",
          icons: CalendarCheck,
          link: "/admin/admin_exam_schedule_builder",
        },
      ],
    },
    {
      title: "Financial & Accounting",
      icons: DollarSign,
      submenu: [
        {
          label: "Tuition Fee Setup",
          icons: DollarSign,
          link: "/admin/admin_tuition_fee_setup",
        },
        {
          label: "Payment Collection",
          icons: DollarSign,
          link: "/admin/admin_payment_collection",
        },
        {
          label: "Invoice Management",
          icons: FileText,
          link: "/admin/admin_invoice_management",
        },
        {
          label: "Scholarship Fund Allocation",
          icons: Award,
          link: "/admin/admin_scholarship_fund",
        },
        {
          label: "Income & Expenses Reports",
          icons: ReportIcon,
          link: "/admin/admin_income_expenses",
        },
        {
          label: "Payment Gateway",
          icons: DollarSign,
          link: "/admin/admin_payment_gateway",
        },
      ],
    },
    {
      title: "HR & Payroll",
      icons: Lock,
      submenu: [
        {
          label: "Employee records",
          icons: Users,
          link: "/admin/admin_employee_records",
        },
        {
          label: "Staff Leave",
          icons: CalendarCheck,
          link: "/admin/admin_staff_leave",
        },
        {
          label: "Payslip Generator",
          icons: DollarSign,
          link: "/admin/admin_payslip_generator",
        },
        {
          label: "Deduction Management",
          icons: DollarSign,
          link: "/admin/admin_deduction_management",
        },
        {
          label: "Payroll Reports",
          icons: ReportIcon,
          link: "/admin/admin_payroll_reports",
        },
      ],
    },
    {
      title: "Library Management",
      icons: Book,
      submenu: [
        {
          label: "Book Catalog",
          icons: Book,
          link: "/admin/admin_library_management",
        },
        {
          label: "Borrow & Return",
          icons: BookOpen,
          link: "/admin/admin_borrow_return",
        },
        {
          label: "Lost & Damage logs",
          icons: FileText,
          link: "/admin/admin_lost_damage_logs",
        },
        {
          label: "Digital Library",
          icons: BookOpen,
          link: "/admin/admin_digital_library",
        },
      ],
    },
    {
      title: "Learning Management",
      icons: BookOpen,
      submenu: [
        { label: "Manage Room", icons: Home, link: "/admin_manage_room" },
      ],
    },
    {
      title: "Scholarship & Grants",
      icons: Award,
      submenu: [
        {
          label: "Application form",
          icons: FileText,
          link: "/admin/admin_application_forms",
        },
        {
          label: "Scholarship Type Setup",
          icons: Award,
          link: "/admin/admin_scholar_type_setup",
        },
        {
          label: "Benefeciary list",
          icons: Users,
          link: "/admin/admin_benefeciary_list",
        },
        {
          label: "Eligibility Screening",
          icons: CheckSquare,
          link: "/admin/admin_eligibility_screening",
        },
      ],
    },
    {
      title: "Events & Communication",
      icons: Bell,
      submenu: [
        {
          label: "Announcement Center",
          icons: Bell,
          link: "/admin/admin_announcement_center",
        },
        {
          label: "Event Scheduling",
          icons: CalendarCheck,
          link: "/admin/admin_event_scheduling",
        },
        {
          label: "School Calendar",
          icons: Calendar,
          link: "/admin/admin_school_calendar",
        },
        {
          label: "Public Event Posting",
          icons: Mail,
          link: "/admin/admin_public_event_posting",
        },
      ],
    },
    {
      title: "Inventory Management",
      icons: ClipboardList,
      submenu: [
        {
          label: "Assets List",
          icons: ClipboardList,
          link: "/admin/admin_inventory_asset_management",
        },
      ],
    },
    {
      title: "Report & Analytics",
      icons: ReportIcon,
      submenu: [
        {
          label: "Reports",
          icons: ReportIcon,
          link: "/admin/admin_student_reports",
        }/* ,
        {
          label: "Enrollment Reports",
          icons: ReportIcon,
          link: "/admin/admin_enrollment_reports",
        },
        {
          label: "Attendance Reports",
          icons: ReportIcon,
          link: "/admin/admin_attendance_reports",
        },
        {
          label: "HR & Payroll Reports",
          icons: ReportIcon,
          link: "/admin/admin_hr_payroll_reports",
        }, */
      ],
    },
    {
      title: "User Management",

      icons: Users,
      path: "/admin/admin_manage_users",
    },
    {
      title: "System Settings",
      icons: Settings,
      submenu: [
        {
          label: "General setting",
          icons: Settings,
          link: "/admin/admin_general_setting",
        },
        {
          label: "Email & SMS gateway",
          icons: Mail,
          link: "/admin/admin_email_sms_gateway",
        },
        { label: "System logs", icons: FileText, link: "/admin/admin_system_logs" },
      ],
    },
  ],

  Faculty: [
    {
      title: "Dashboard",
      icons: LayoutDashboard,
      path: "/faculty/faculty_dashboard",
    },
    {
      title: "Profile",
      icons: Users,
      path: "/faculty/faculty_profile",
    },
    {
      title: "My Courses",
      icons: BookOpen,
      submenu: [
        {
          label: "Assigned Subjects & Sections",
          icons: BookOpen,
          link: "/faculty/faculty_assigned_subjects",
        },
        {
          label: "Syllabus Upload",
          icons: FileText,
          link: "/faculty/faculty_syllabus_upload",
        },
        { label: "Student List", icons: Users, link: "/faculty/faculty_student_list" },
      ],
    },
    {
      title: "Attendance",
      icons: CalendarCheck,
      submenu: [
        {
          label: "Mark Attendance",
          icons: CalendarCheck,
          link: "/faculty/faculty_mark_attendance",
        },
        {
          label: "Absentee Alerts",
          icons: Bell,
          link: "/faculty/faculty_absentee_alerts",
        },
      ],
    },
    {
      title: "Grades",
      icons: CheckSquare,
      submenu: [
        {
          label: "Grade Encoding",
          icons: FileText,
          link: "/faculty/faculty_grade_encoding",
        },
        {
          label: "Grade Review",
          icons: CheckSquare,
          link: "/faculty/faculty_grade_review",
        },
      ],
    },
    {
      title: "LMS",
      icons: BookOpen,
      submenu: [
        {
          label: "Upload Learning Materials",
          icons: BookOpen,
          link: "/faculty/faculty_lms_materials",
        },
        {
          label: "Assignments & Quizzes",
          icons: FileText,
          link: "/faculty/faculty_lms_assignments",
        },
        {
          label: "Class Discussion",
          icons: MessageCircle,
          link: "/faculty/faculty_lms_discussion",
        },
      ],
    },
    {
      title: "Communication",
      icons: Mail,
      submenu: [
        { label: "Announcements", icons: Bell, link: "/faculty/faculty_announcements" },
        {
          label: "Private Messaging",
          icons: MessageCircle,
          link: "/faculty/faculty_messaging",
        },
        { label: "Email Student", icons: Mail, link: "/faculty/faculty_email_student" },
      ],
    },
    {
      title: "Reports",
      icons: ReportIcon,
      submenu: [
        {
          label: "Grade Reports",
          icons: ReportIcon,
          link: "/faculty/faculty_report_grades",
        },
        {
          label: "Attendance Reports",
          icons: ReportIcon,
          link: "/faculty/faculty_report_attendance",
        },
        {
          label: "Class Performance",
          icons: ReportIcon,
          link: "/faculty/faculty_report_performance",
        },
      ],
    },
  ],

  Student: [
    {
      title: "Dashboard",
      icons: LayoutDashboard,

          path: "/student/student_dashboard",
        
    },
    {
title: "Profile",
icons: Users,
path: "/student/student_profile",
    },
    {
      title: "My Courses",
      icons: BookOpen,
      
          path: "/student/student_courses",
       
    },
    {
      title: "Academic",
      icons: GraduationCap,
      
          path: "/student/student_academic",
       
    },
    {
      title: "LMS",
      icons: BookOpen,
      
          path: "/student/student_lms_lessons",
       
    },
    {
      title: "Attendance",
      icons: CalendarCheck,
      
          path: "/student/student_attendance_logs",
       
    },
    {
      title: "Announcements",
      icons: Bell,
       path: "/student/student_feedback" 
    },
    {
      title: "Calendar",
      icons: Calendar,
      
          path: "/student/student_calendar_exams",
       
    },
    {
      title: "Communication",
      icons: Mail,
      
          path: "/student/student_communication",
       
    },
    {
      title: "Finance",
      icons: DollarSign,
      
          path: "/student/student_finance",
       
    },
  ],

  hr_payroll: [
    {
      title: "Dashboard",
      icons: LayoutDashboard,
      submenu: [
        { label: "Overview", icons: LayoutDashboard, link: "/hr_dashboard" },
      ],
    },
    {
      title: "Employee Management",
      icons: Users,
      submenu: [
        { label: "Staff Profiles", icons: Users, link: "/hr_staff_profiles" },
        {
          label: "Faculty Assignment",
          icons: GraduationCap,
          link: "/hr_faculty_assignment",
        },
        {
          label: "Leave & Attendance Logs",
          icons: CalendarCheck,
          link: "/hr_attendance_logs",
        },
      ],
    },
    {
      title: "Payroll",
      icons: DollarSign,
      submenu: [
        {
          label: "Payroll Setup",
          icons: DollarSign,
          link: "/hr_payroll_setup",
        },
        {
          label: "Pay Computation",
          icons: DollarSign,
          link: "/hr_pay_computation",
        },
        { label: "Incentives", icons: Award, link: "/hr_incentives" },
        {
          label: "Payment Download",
          icons: DollarSign,
          link: "/hr_payment_download",
        },
      ],
    },
    {
      title: "Reports",
      icons: ReportIcon,
      submenu: [
        {
          label: "Payroll Reports",
          icons: ReportIcon,
          link: "/hr_report_payroll",
        },
        {
          label: "Employee Attendance Reports",
          icons: ReportIcon,
          link: "/hr_report_attendance",
        },
      ],
    },
  ],

  accounting: [
    {
      title: "Dashboard",
      icons: LayoutDashboard,
      submenu: [
        {
          label: "Overview",
          icons: LayoutDashboard,
          link: "/accounting_dashboard",
        },
      ],
    },
    {
      title: "Fees Management",
      icons: DollarSign,
      submenu: [
        {
          label: "Billing & Invoice",
          icons: DollarSign,
          link: "/accounting_billing",
        },
        {
          label: "Payment Tracking",
          icons: DollarSign,
          link: "/accounting_payment_tracking",
        },
        {
          label: "Refund Management",
          icons: DollarSign,
          link: "/accounting_refund_management",
        },
      ],
    },
    {
      title: "Finance",
      icons: DollarSign,
      submenu: [
        {
          label: "Income / Expenses",
          icons: DollarSign,
          link: "/accounting_income_expenses",
        },
        {
          label: "Ledger Entries",
          icons: FileText,
          link: "/accounting_ledger_entries",
        },
        {
          label: "Budget Allocation",
          icons: DollarSign,
          link: "/accounting_budget_allocation",
        },
        {
          label: "Expenses Approval",
          icons: CheckSquare,
          link: "/accounting_expenses_approval",
        },
      ],
    },
    {
      title: "Scholarship",
      icons: Award,
      submenu: [
        {
          label: "Fund Setup",
          icons: Award,
          link: "/accounting_scholarship_setup",
        },
        {
          label: "Disbursement History",
          icons: FileText,
          link: "/accounting_scholarship_disbursement",
        },
        {
          label: "Scholarship Reports",
          icons: ReportIcon,
          link: "/accounting_scholarship_reports",
        },
      ],
    },
    {
      title: "Reports",
      icons: ReportIcon,
      submenu: [
        {
          label: "General Financial Reports",
          icons: ReportIcon,
          link: "/accounting_reports_general",
        },
      ],
    },
  ],

  staff: [
    {
      title: "Dashboard",
      icons: LayoutDashboard,
      submenu: [
        { label: "Overview", icons: LayoutDashboard, link: "/staff_dashboard" },
      ],
    },
    {
      title: "Library",
      icons: Book,
      submenu: [
        { label: "Book Management", icons: Book, link: "/staff_library_books" },
        {
          label: "Borrower Logs",
          icons: ClipboardList,
          link: "/staff_library_borrowers",
        },
        {
          label: "Penalty Records",
          icons: FileText,
          link: "/staff_library_penalties",
        },
      ],
    },
    {
      title: "Inventory",
      icons: ClipboardList,
      submenu: [
        {
          label: "Assets",
          icons: ClipboardList,
          link: "/staff_inventory_assets",
        },
        {
          label: "Maintenance",
          icons: FileText,
          link: "/staff_inventory_maintenance",
        },
        { label: "Requests", icons: Mail, link: "/staff_inventory_requests" },
      ],
    },
  ],
};

export default Menu;
