import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, FileText, Clock, MapPin, Users, BookOpen } from "lucide-react";

const StudentCalendar = () => {
  const [activeTab, setActiveTab] = useState("exams");
  const [exams, setExams] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "exams") {
        await fetchExams();
      } else {
        await fetchEvents();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/student/calendar/exams");
      const data = await response.json();
      if (data.success) setExams(data.data);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/student/calendar/events");
      const data = await response.json();
      if (data.success) setEvents(data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const getExamTypeColor = (type) => {
    const colors = {
      midterm: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      final: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      quiz: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      prelim: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
    return colors[type] || "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
  };

  const getEventTypeColor = (type) => {
    const colors = {
      academic: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
      cultural: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
      sports: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      social: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      orientation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return colors[type] || "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
  };

  const isUpcoming = (date) => {
    return new Date(date) > new Date();
  };

  const tabs = [
    { id: "exams", label: "Exam Schedule", icon: FileText },
    { id: "events", label: "School Events", icon: CalendarIcon },
  ];

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon size={24} className="text-indigo-600" />
            Academic Calendar
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Exams & Events
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

        {/* Exam Schedule Tab */}
        {activeTab === "exams" && (
          <div className="space-y-3">
            {exams.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
                <FileText size={48} className="mx-auto text-slate-400 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No upcoming exams scheduled</p>
              </div>
            ) : (
              exams.map((exam) => (
                <div
                  key={exam.exam_id}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <BookOpen size={18} className="text-indigo-600" />
                            {exam.subject_name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{exam.title}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getExamTypeColor(exam.exam_type)}`}>
                          {exam.exam_type}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm mt-3">
                        <div className="flex items-center gap-2">
                          <CalendarIcon size={16} className="text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {new Date(exam.exam_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Time</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {exam.start_time && new Date(`2000-01-01T${exam.start_time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - 
                              {exam.end_time && new Date(`2000-01-01T${exam.end_time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Room</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{exam.room || "TBA"}</p>
                          </div>
                        </div>
                      </div>

                      {exam.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                          <strong>Notes:</strong> {exam.description}
                        </p>
                      )}
                    </div>

                    {isUpcoming(exam.exam_date) && (
                      <div className="lg:text-right">
                        <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Upcoming</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {Math.ceil((new Date(exam.exam_date) - new Date()) / (1000 * 60 * 60 * 24))} days left
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* School Events Tab */}
        {activeTab === "events" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.length === 0 ? (
              <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
                <CalendarIcon size={48} className="mx-auto text-slate-400 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No upcoming events</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.event_id}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{event.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getEventTypeColor(event.event_type)}`}>
                      {event.event_type}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon size={16} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Event Date</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {new Date(event.event_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {event.start_time && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Time</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {event.end_time && ` - ${new Date(`2000-01-01T${event.end_time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{event.location}</p>
                        </div>
                      </div>
                    )}

                    {event.target_audience && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={16} className="text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">For</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{event.target_audience}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {event.registration_required && (
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
                      Register Now
                    </button>
                  )}

                  {isUpcoming(event.event_date) && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-center">
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        {Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24))} days until event
                      </span>
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

export default StudentCalendar;
