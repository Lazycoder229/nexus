import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Camera,
  Lock,
  Edit,
} from "lucide-react";

const HRProfile = () => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    employeeId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    department: "",
    position: "",
    specialization: "",
    dateHired: "",
    employmentStatus: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API
      // const response = await axios.get('/api/hr/profile');
      // Mock data
      setProfileData({
        employeeId: "HR-2024-001",
        firstName: "Jane",
        middleName: "Ann",
        lastName: "Smith",
        suffix: "",
        email: "hr@nexus.com",
        phone: "09987654321",
        address: "456 HR Avenue, City, Province",
        dateOfBirth: "1988-03-22",
        gender: "Female",
        department: "Human Resources",
        position: "HR Manager",
        specialization: "Payroll, Employee Relations",
        dateHired: "2017-04-10",
        employmentStatus: "Full-time",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // TODO: Replace with actual API
      // await axios.put('/api/hr/profile', profileData);
      setTimeout(() => {
        alert("Profile updated successfully!");
        setEditing(false);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    try {
      setLoading(true);
      // TODO: Replace with actual API
      // await axios.put('/api/hr/change-password', passwordData);
      setTimeout(() => {
        alert("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <User className="w-8 h-8 mr-3 text-indigo-600" />
          HR Profile
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col items-center">
              {/* Profile Photo */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold">
                  {profileData.firstName ? profileData.firstName[0] : "H"}
                  {profileData.lastName ? profileData.lastName[0] : "R"}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {profileData.firstName}{" "}
                {profileData.middleName && `${profileData.middleName[0]}.`}{" "}
                {profileData.lastName}
                {profileData.suffix && ` ${profileData.suffix}`}
              </h2>
              <p className="text-sm text-gray-500">{profileData.employeeId}</p>
              <p className="text-sm font-medium text-indigo-600 mt-1">
                {profileData.position}
              </p>
              <p className="text-sm text-gray-600">{profileData.department}</p>

              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-indigo-500" />
                  <span className="break-all">{profileData.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-indigo-500" />
                  <span>{profileData.phone}</span>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 mt-1 text-indigo-500 flex-shrink-0" />
                  <span>{profileData.address}</span>
                </div>
              </div>

              <div className="w-full mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Personal Information
              </h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      value={profileData.middleName}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suffix
                    </label>
                    <select
                      name="suffix"
                      value={profileData.suffix}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">None</option>
                      <option value="Jr.">Jr.</option>
                      <option value="Sr.">Sr.</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profileData.dateOfBirth}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      disabled={!editing}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Employment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={profileData.employeeId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={profileData.department}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      value={profileData.position}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Hired
                    </label>
                    <input
                      type="date"
                      value={profileData.dateHired}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={profileData.specialization}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Password Change Form */}
          {showPasswordForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Change Password
              </h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                {passwordData.newPassword &&
                  passwordData.confirmPassword &&
                  passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-xs text-red-500 font-medium">
                      Passwords do not match
                    </p>
                  )}
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      passwordData.newPassword !== passwordData.confirmPassword
                    }
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRProfile;
