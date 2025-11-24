// src/components/SidebarData.js

// 1. Import icons from lucide-react
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpenText,
  ClipboardCheck,
  ClipboardList,
  Wallet,
  Briefcase,
  Library,
  Award,
  Calendar,
  Package,
  LineChart,
  Settings,
  User2Icon,
} from "lucide-react";

export const SidebarLinks = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard, // Use the component directly
  },
  {
    title: "Department Management",
    path: "/department",
    icon: Building2,
  },
  {
    title: "Student Information System",
    path: "/students",
    icon: Users,
  },
  {
    title: "Academic Management",
    path: "/academic",
    icon: BookOpenText,
  },
  {
    title: "Attendance Management",
    path: "/attendance",
    icon: ClipboardCheck,
  },
  {
    title: "Examination Management",
    path: "/examination",
    icon: ClipboardList,
  },
  // --- Separator ---
  {
    title: "Finance & Accounting",
    path: "/finance",
    icon: Wallet,
  },
  {
    title: "HR & Payroll",
    path: "/hr",
    icon: Briefcase,
  },
  {
    title: "Library Management",
    path: "/library",
    icon: Library,
  },
  {
    title: "Scholarship",
    path: "/scholarship",
    icon: Award,
  },
  // --- Separator ---
  {
    title: "Event & Communication",
    path: "/events",
    icon: Calendar,
  },
  {
    title: "Inventory",
    path: "/inventory",
    icon: Package,
  },
  {
    title: "Reports",
    path: "/reports",
    icon: LineChart,
  },
  {
    title: "User Management",
    path: "/usermanagement",
    icon: User2Icon,
  },
  {
    title: "System Setting",
    path: "/settings",
    icon: Settings,
  },
];
