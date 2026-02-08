import { useState, useEffect } from "react";
import axios from "axios";
import { MessageCircle, Bell, Star, Send, Filter, CheckCircle, AlertCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const StudentAnnouncements = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [filter, setFilter] = useState("all");
  const [feedbackForm, setFeedbackForm] = useState({
    category: "",
    rating: 5,
    message: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "notifications") {
        await fetchNotifications();
      } else {
        await fetchFeedback();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/events/announcements`);
      const data = response.data || [];
      // Transform announcements to notification format
      setNotifications(data.map(item => ({
        notification_id: item.id || item.announcement_id,
        title: item.title,
        message: item.content || item.message,
        type: item.type || 'announcement',
        priority: item.priority || 'medium',
        is_read: item.is_read || false,
        created_at: item.created_at,
      })));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/feedback`);
      const data = response.data || [];
      setFeedbackList(data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setFeedbackList([]);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/feedback`, feedbackForm);
      alert("Feedback submitted successfully!");
      setFeedbackForm({ category: "", rating: 5, message: "" });
      fetchFeedback();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback");
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_BASE}/api/events/announcements/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      announcement: { icon: Bell, color: "text-blue-600" },
      grade: { icon: CheckCircle, color: "text-green-600" },
      alert: { icon: AlertCircle, color: "text-red-600" },
      event: { icon: MessageCircle, color: "text-purple-600" },
    };
    return icons[type] || icons.announcement;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
    return colors[priority] || colors.low;
  };

  const filteredNotifications =
    filter === "all" ? notifications : filter === "unread" ? notifications.filter((n) => !n.is_read) : notifications.filter((n) => n.is_read);

  const tabs = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "feedback", label: "Submit Feedback", icon: MessageCircle },
  ];

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={24} className="text-indigo-600" />
            Announcements & Feedback
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Stay Informed
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
                className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.id === "notifications" && notifications.filter((n) => !n.is_read).length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {notifications.filter((n) => !n.is_read).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === "unread"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
              >
                Unread ({notifications.filter((n) => !n.is_read).length})
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === "read"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
              >
                Read ({notifications.filter((n) => n.is_read).length})
              </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
                  <Bell size={48} className="mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">No notifications to display</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const { icon: Icon, color } = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.notification_id}
                      className={`bg-white dark:bg-slate-800 rounded-lg border p-4 hover:shadow-md transition-shadow ${notification.is_read
                          ? "border-slate-200 dark:border-slate-700"
                          : "border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10"
                        }`}
                    >
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 ${color}`}>
                          <Icon size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{notification.title}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{notification.message}</p>
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.notification_id)}
                              className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                            >
                              <CheckCircle size={14} />
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === "feedback" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Feedback Form */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-indigo-600" />
                Submit Your Feedback
              </h3>
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                  <select
                    value={feedbackForm.category}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="academics">Academics</option>
                    <option value="facilities">Facilities</option>
                    <option value="services">Services</option>
                    <option value="faculty">Faculty</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                        className={`p-2 transition-colors ${star <= feedbackForm.rating ? "text-yellow-500" : "text-slate-300 dark:text-slate-600"
                          }`}
                      >
                        <Star size={24} fill={star <= feedbackForm.rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
                  <textarea
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Share your thoughts..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  <Send size={16} />
                  Submit Feedback
                </button>
              </form>
            </div>

            {/* Previous Feedback */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Your Previous Feedback</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {feedbackList.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">No feedback submitted yet</p>
                ) : (
                  feedbackList.map((feedback) => (
                    <div
                      key={feedback.feedback_id || feedback.id}
                      className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded">
                          {feedback.category}
                        </span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < feedback.rating ? "text-yellow-500 fill-current" : "text-slate-300 dark:text-slate-600"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{feedback.message}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(feedback.submitted_at || feedback.created_at).toLocaleDateString()}
                      </p>
                      {feedback.response && (
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Response:</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{feedback.response}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAnnouncements;
