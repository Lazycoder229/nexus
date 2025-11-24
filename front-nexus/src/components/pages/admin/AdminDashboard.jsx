import React from "react";
import dayjs from "dayjs";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Briefcase,
  CalendarDays,
} from "lucide-react";

// ---------- Sample Data ----------
const statsData = [
  {
    title: "Total Students",
    value: "4,521",
    icon: Users,
    color: "bg-indigo-600",
    detail: "+12 new this month",
  },
  {
    title: "Active Courses",
    value: "89",
    icon: BookOpen,
    color: "bg-green-600",
    detail: "4 departments involved",
  },
  {
    title: "Faculty Members",
    value: "128",
    icon: Briefcase,
    color: "bg-red-600",
    detail: "2 pending reviews",
  },
  {
    title: "Financial Aid Requests",
    value: "34",
    icon: LayoutDashboard,
    color: "bg-yellow-600",
    detail: "Action required in 24h",
  },
];

// Recent Activity Data
const activityData = [
  {
    type: "Student Enrollment",
    detail: "New student, Mark Sotto, registered for CS.",
    time: "10 mins ago",
    color: "border-green-500",
    icon: Users,
  },
  {
    type: "Faculty Absence",
    detail: "Prof. Cruz reported absence for upcoming lecture.",
    time: "1 hour ago",
    color: "border-red-500",
    icon: Briefcase,
  },
  {
    type: "Course Creation",
    detail: 'New course "Advanced AI" approved by committee.',
    time: "2 hours ago",
    color: "border-indigo-500",
    icon: BookOpen,
  },
  {
    type: "Financial Payment",
    detail: "Tuition payment received from Jane Doe.",
    time: "4 hours ago",
    color: "border-yellow-500",
    icon: LayoutDashboard,
  },
];

// ---------- Helper Components ----------

// Smaller Stats Card
const Card = ({ title, value, icon: Icon, color, detail }) => (
  <div className="bg-white p-4 rounded-xl shadow border border-gray-100 transform hover:scale-[1.02] transition duration-300 relative overflow-hidden h-36 flex flex-col justify-between">
    <div className={`absolute top-0 left-0 w-full h-1 ${color}`}></div>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">{value}</h2>
      </div>
      <div
        className={`p-3 rounded-full flex items-center justify-center ${color}`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <p className="mt-2 text-[10px] font-semibold text-gray-500">{detail}</p>
  </div>
);

// Recent Activity
const RecentActivity = () => (
  <div className="bg-white p-4 rounded-xl shadow border border-gray-100 h-full">
    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center space-x-2">
      <LayoutDashboard className="w-5 h-5 text-indigo-500" />
      <span>Recent System Activity</span>
    </h3>
    <ul className="space-y-3 text-sm">
      {activityData.map((item, index) => (
        <li
          key={index}
          className={`flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 transition border-l-4 ${item.color}`}
        >
          <item.icon
            className={`w-4 h-4 flex-shrink-0 mt-0.5 ${item.color.replace(
              "border-",
              "text-"
            )}`}
          />
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-800">{item.detail}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{item.time}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

// Upcoming Calendar using dayjs
const UpcomingCalendar = () => {
  const today = dayjs();
  const startOfMonth = today.startOf("month");
  const endOfMonth = today.endOf("month");
  const daysInMonth = endOfMonth.date();
  const firstDayIndex = startOfMonth.day(); // Sunday = 0

  const events = {
    [today.date()]: "Current Day",
    10: "Registration Deadline",
    18: "Faculty Meeting",
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white p-4 rounded-xl shadow border border-gray-100 h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center space-x-2">
        <CalendarDays className="w-5 h-5 text-indigo-500" />
        <span>Upcoming Events: {today.format("MMMM YYYY")}</span>
      </h3>
      <div className="grid grid-cols-7 text-center text-xs font-medium gap-1">
        {days.map((day) => (
          <div key={day} className="text-gray-500 font-semibold">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div key={`empty-${idx}`} className="p-1"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const isToday = day === today.date();
          const event = events[day];

          let classes =
            "p-1 text-xs rounded transition duration-150 cursor-pointer h-8 flex items-center justify-center relative ";

          if (isToday) {
            classes +=
              "bg-indigo-600 text-white font-bold shadow transform scale-105";
          } else if (event) {
            classes +=
              "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-semibold border-2 border-yellow-500";
          } else {
            classes += "text-gray-700 hover:bg-gray-50";
          }

          return (
            <div key={day} className={classes} title={event || ""}>
              {day}
              {event && (
                <span className="absolute bottom-0.5 right-0.5 h-1 w-1 bg-yellow-600 rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Admin Dashboard Page ----------
export default function AdminDashboard() {
  return (
    <div className="h-[80vh] font-sans text-gray-800">
      <main className="p-4">
        <div className="space-y-4">
          {/* Dashboard Header */}
          <div className="border-b-4 border-indigo-600 pb-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return "Good Morning, Admin";
                  else if (hour < 18) return "Good Afternoon, Admin";
                  else return "Good Evening, Admin";
                })()}
              </h2>
            </div>
            <p className="mt-1 text-gray-500 text-base">
              Central management and real-time overview of college operations.
            </p>
          </div>

          {/* Stats */}
          <h3 className="text-xl font-bold text-gray-700">
            Key Performance Indicators
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat) => (
              <Card key={stat.title} {...stat} />
            ))}
          </div>

          {/* Recent Activity & Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RecentActivity />
            <UpcomingCalendar />
          </div>
        </div>
      </main>
    </div>
  );
}
