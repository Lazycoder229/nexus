import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Clock, MapPin, Users, BookOpen } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [selectedDay, setSelectedDay] = useState("all");

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/schedules`);
      const schedules = response.data || [];
      setTimetable(schedules.map(s => ({
        day: s.day || 'Monday',
        subject_name: s.course_name || s.subject_name,
        subject_code: s.course_code || s.subject_code,
        start_time: s.start_time,
        end_time: s.end_time,
        room: s.room || s.location || 'TBA',
        instructor: s.instructor_name || s.instructor || 'TBA',
      })));
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const filteredTimetable = selectedDay === "all" ? timetable : timetable.filter(t => t.day === selectedDay);

  const groupedByDay = days.reduce((acc, day) => {
    acc[day] = timetable.filter(t => t.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {});

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar size={24} className="text-indigo-600" />
            My Timetable
          </h2>
        </div>

        {/* Day Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedDay("all")}
            className={`px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap ${selectedDay === "all"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
          >
            All Days
          </button>
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap ${selectedDay === day
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Timetable Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {days.map((day) => {
            const classes = groupedByDay[day];
            if (selectedDay !== "all" && selectedDay !== day) return null;

            return (
              <div key={day} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-600" />
                  {day}
                </h3>
                <div className="space-y-2">
                  {classes.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-4 text-sm">No classes scheduled</p>
                  ) : (
                    classes.map((classItem, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold text-slate-900 dark:text-white">{classItem.subject_name}</div>
                          <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                            <Clock size={12} />
                            {classItem.start_time} - {classItem.end_time}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <BookOpen size={12} />
                            {classItem.subject_code}
                          </span>
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <MapPin size={12} />
                            {classItem.room}
                          </span>
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <Users size={12} />
                            {classItem.instructor}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;
