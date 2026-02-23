import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import {
    Award,
    Search,
    Info,
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    Filter,
    ArrowRight
} from "lucide-react";

const StudentScholarships = () => {
    const [programs, setPrograms] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const studentId = localStorage.getItem("userId");

            const [programsRes, appsRes] = await Promise.all([
                api.get(`/api/scholarships/programs?is_active=1`),
                studentId ? api.get(`/api/scholarships/student/${studentId}`) : Promise.resolve({ data: { data: [] } })
            ]);

            setPrograms(programsRes.data.data || []);
            setMyApplications(appsRes.data.data || []);
        } catch (err) {
            console.error("Error fetching scholarship data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!selectedProgram) return;

        try {
            setSubmitting(true);
            const studentId = localStorage.getItem("userId");

            if (!studentId) {
                alert("Please log in to apply for scholarships.");
                return;
            }

            const payload = {
                scholarship_id: selectedProgram.scholarship_id,
                student_id: parseInt(studentId),
                academic_period_id: selectedProgram.academic_period_id,
                status: 'Pending',
                remarks: `Applied for ${selectedProgram.scholarship_name} via student portal`
            };

            await api.post(`/api/scholarships/applications`, payload);

            alert(`Application for ${selectedProgram.scholarship_name} submitted successfully!`);
            setShowApplyModal(false);
            setSelectedProgram(null);
            fetchData(); // Refresh lists
        } catch (err) {
            console.error("Error submitting application:", err);
            alert(err.response?.data?.error || "Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'active':
                return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"><CheckCircle size={14} /> Approved</span>;
            case 'pending':
                return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium"><Clock size={14} /> Pending</span>;
            case 'rejected':
            case 'cancelled':
                return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium"><AlertCircle size={14} /> {status}</span>;
            default:
                return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{status}</span>;
        }
    };

    const appliedIds = new Set(myApplications.map(app => app.scholarship_id));

    const filteredPrograms = programs.filter(p => {
        // Exclude if already applied
        if (appliedIds.has(p.scholarship_id)) return false;

        // Search filter
        return (p.scholarship_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.scholarship_code || "").toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Award className="text-indigo-600" />
                        Scholarships & Grants
                    </h1>
                    <p className="text-slate-500">View available programs and track your applications</p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Active Applications</p>
                    <p className="text-2xl font-bold text-slate-900">{myApplications.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Approved Grants</p>
                    <p className="text-2xl font-bold text-green-600">
                        {myApplications.filter(a => a.status === 'Approved' || a.status === 'Active').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Available Programs</p>
                    <p className="text-2xl font-bold text-indigo-600">{programs.length}</p>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="space-y-6">
                {/* My Applications Section */}
                <section>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-indigo-500" />
                        My Applications
                    </h2>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Program</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Period</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount/Discount</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {myApplications.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Clock size={32} className="text-slate-300" />
                                                    <p>You haven't applied for any scholarships yet.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        myApplications.map((app) => (
                                            <tr key={app.allocation_id || app.application_id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-slate-900">{app.program_name}</div>
                                                    <div className="text-xs text-slate-500">{app.scholarship_code}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-700">{app.school_year} - {app.semester}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {/* Tuition Discount Display */}
                                                    {app.tuition_discount > 0 ? (
                                                        <div className="text-xs font-medium text-green-600 font-bold">{app.tuition_discount}% Tuition Discount</div>
                                                    ) : (
                                                        app.discount_type === 'Percentage' && app.discount_value > 0 ? (
                                                            <div className="text-xs font-medium text-green-600 font-bold">{app.discount_value}% Tuition Discount</div>
                                                        ) : (
                                                            app.discount_type === 'Fixed' && app.discount_value > 0 && (
                                                                <div className="text-xs font-medium text-green-600 font-bold">₱{app.discount_value.toLocaleString()} Fixed Benefit</div>
                                                            )
                                                        )
                                                    )}

                                                    {/* Allowance Display */}
                                                    {app.allowance_amount > 0 ? (
                                                        <div className="text-xs font-medium text-indigo-600 font-bold">₱{app.allowance_amount.toLocaleString()} Allowance</div>
                                                    ) : (
                                                        app.program_allowance_amount > 0 && (
                                                            <div className="text-xs font-medium text-indigo-600 font-bold">₱{app.program_allowance_amount.toLocaleString()} Allowance</div>
                                                        )
                                                    )}

                                                    {/* If everything is zero, show a placeholder */}
                                                    {!(app.tuition_discount > 0 || app.discount_value > 0 || app.allowance_amount > 0 || app.program_allowance_amount > 0) && (
                                                        <span className="text-xs text-slate-400 italic">No benefits specified</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(app.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <button
                                                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                        onClick={() => {
                                                            setSelectedProgram(programs.find(p => p.scholarship_id === app.scholarship_id));
                                                            // We could show more details here
                                                        }}
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Available Programs Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Filter size={20} className="text-indigo-500" />
                            Available Scholarship Programs
                        </h2>
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search programs..."
                                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />
                            ))
                        ) : filteredPrograms.length === 0 ? (
                            <div className="col-span-full py-10 text-center text-slate-500">
                                No programs found matching your search.
                            </div>
                        ) : (
                            filteredPrograms.map((program) => (
                                <div key={program.scholarship_id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col items-start gap-4">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="bg-indigo-50 p-2 rounded-lg">
                                            <Award className="text-indigo-600" size={24} />
                                        </div>
                                        {program.discount_type === 'Percentage' ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">
                                                {program.discount_value}% OFF
                                            </span>
                                        ) : (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">
                                                ₱{program.discount_value.toLocaleString()} Grant
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-900">{program.scholarship_name}</h3>
                                        <p className="text-xs text-slate-500">{program.scholarship_code}</p>
                                    </div>

                                    <p className="text-sm text-slate-600 line-clamp-2">
                                        {program.description || "This program provides financial assistance to qualified students based on academic performance and need."}
                                    </p>

                                    <div className="w-full pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
                                        <div className="text-xs text-slate-500">
                                            GPA Req: <span className="font-semibold text-slate-700">{program.required_gpa || "N/A"}</span>
                                        </div>
                                        <button
                                            className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                                            onClick={() => {
                                                setSelectedProgram(program);
                                                setShowApplyModal(true);
                                            }}
                                        >
                                            Apply Now <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Details/Apply Modal Backdrop */}
            {selectedProgram && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-indigo-600 p-6 text-white">
                            <h2 className="text-xl font-bold">{selectedProgram.scholarship_name}</h2>
                            <p className="text-indigo-100 text-sm">{selectedProgram.scholarship_code}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {selectedProgram.description || "No detailed description available."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Benefit</h4>
                                    <p className="text-slate-800 font-bold text-green-600">
                                        {selectedProgram.tuition_discount > 0
                                            ? `${selectedProgram.tuition_discount}% Tuition Discount`
                                            : (selectedProgram.discount_type === 'Percentage'
                                                ? `${selectedProgram.discount_value}% Discount`
                                                : (selectedProgram.discount_type === 'Fixed'
                                                    ? `₱${(selectedProgram.discount_value || 0).toLocaleString()} Fixed Benefit`
                                                    : "Percentage/Fixed"))}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Allowance</h4>
                                    <p className="text-slate-800 font-bold text-indigo-600">
                                        ₱{(selectedProgram.allowance_amount || selectedProgram.program_allowance_amount || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requirements</h4>
                                <ul className="text-sm text-slate-700 space-y-1">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={14} className="text-green-500" />
                                        Minimum GPA: {selectedProgram.required_gpa || "None"}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={14} className="text-green-500" />
                                        Max Income: {selectedProgram.required_income_level ? `₱${selectedProgram.required_income_level.toLocaleString()}` : "Not specified"}
                                    </li>
                                </ul>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                                    onClick={() => {
                                        setSelectedProgram(null);
                                        setShowApplyModal(false);
                                    }}
                                >
                                    Close
                                </button>
                                {showApplyModal && (
                                    <button
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
                                        onClick={handleApply}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <span className="flex items-center gap-2">
                                                <Clock className="animate-spin" size={16} /> Submitting...
                                            </span>
                                        ) : (
                                            "Confirm Interest"
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentScholarships;
