import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { Calendar, Clock, MapPin, User, BookOpen, Users } from "lucide-react";

const TimetableBuilder = () => {
  const [sections, setSections] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState(null);
  const [selectedDay, setSelectedDay] = useState("Monday");

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const timeSlots = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  useEffect(() => {
    fetchSections();
    fetchPeriods();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/sections");
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const fetchPeriods = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/academic-periods"
      );
      setPeriods(response.data);
    } catch (error) {
      console.error("Error fetching periods:", error);
    }
  };

  // Filter sections by selected period and day
  const filteredSections = sections.filter((section) => {
    const matchesPeriod =
      !filterPeriod || section.period_id === filterPeriod.value;
    const matchesDay =
      !section.schedule_day || section.schedule_day === selectedDay;
    return matchesPeriod && matchesDay && section.schedule_time_start;
  });

  // Group sections by time slot
  const getSectionsForTimeSlot = (timeSlot) => {
    return filteredSections.filter((section) => {
      if (!section.schedule_time_start) return false;
      const sectionStart = section.schedule_time_start.substring(0, 5);
      return sectionStart === timeSlot;
    });
  };

  const periodOptions = periods.map((period) => ({
    value: period.period_id,
    label: `${period.period_name} ${period.year}`,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Timetable Builder
          </h1>
          <p className="text-gray-600">
            Visual weekly schedule overview and planning tool
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Classes ({selectedDay})
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {filteredSections.length}
                </p>
              </div>
              <BookOpen className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Time Slots
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {
                    timeSlots.filter(
                      (t) => getSectionsForTimeSlot(t).length > 0
                    ).length
                  }
                </p>
              </div>
              <Clock className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {filteredSections.reduce(
                    (sum, s) => sum + s.current_enrolled,
                    0
                  )}
                </p>
              </div>
              <Users className="text-purple-500" size={40} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="w-full lg:w-80">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Period
              </label>
              <Select
                options={periodOptions}
                value={filterPeriod}
                onChange={setFilterPeriod}
                placeholder="Select Academic Period"
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            {/* Day Tabs */}
            <div className="flex gap-2 flex-wrap">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedDay === day
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <Calendar className="text-blue-600" size={28} />
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedDay} Schedule
            </h2>
          </div>

          <div className="space-y-4">
            {timeSlots.map((timeSlot) => {
              const sectionsAtTime = getSectionsForTimeSlot(timeSlot);
              const hasClasses = sectionsAtTime.length > 0;

              return (
                <div
                  key={timeSlot}
                  className={`grid grid-cols-[120px_1fr] gap-4 p-4 rounded-lg border transition-all ${
                    hasClasses
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {/* Time Column */}
                  <div className="flex items-center gap-2">
                    <Clock className="text-gray-500" size={18} />
                    <span className="font-bold text-gray-900">{timeSlot}</span>
                  </div>

                  {/* Classes Column */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {hasClasses ? (
                      sectionsAtTime.map((section, index) => {
                        const colors = [
                          "border-blue-500 bg-blue-50",
                          "border-green-500 bg-green-50",
                          "border-purple-500 bg-purple-50",
                          "border-orange-500 bg-orange-50",
                          "border-pink-500 bg-pink-50",
                          "border-indigo-500 bg-indigo-50",
                        ];
                        const colorClass = colors[index % colors.length];

                        return (
                          <div
                            key={section.section_id}
                            className={`border-l-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${colorClass}`}
                          >
                            <div className="font-bold text-gray-900 mb-2">
                              {section.course_code} - {section.section_name}
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                              {section.course_title}
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Clock size={14} />
                                <span>
                                  {section.schedule_time_start} -{" "}
                                  {section.schedule_time_end}
                                </span>
                              </div>
                              {section.room && (
                                <div className="flex items-center gap-2 text-gray-700">
                                  <MapPin size={14} />
                                  <span>{section.room}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-gray-700">
                                <Users size={14} />
                                <span>
                                  {section.current_enrolled}/
                                  {section.max_capacity} students
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                              {section.period_name} {section.year}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full text-center py-4 text-gray-400 italic">
                        No classes scheduled
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableBuilder;
