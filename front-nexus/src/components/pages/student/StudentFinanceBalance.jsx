import { useState, useEffect } from "react";
import { DollarSign, Download, Eye, Printer, Search, ChevronLeft, ChevronRight, Receipt, Calendar } from "lucide-react";

const StudentFinanceBalance = () => {
  const [balance, setBalance] = useState(null);
  const [paymentSchedule, setPaymentSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balanceRes, scheduleRes] = await Promise.all([
        fetch("http://localhost:5000/api/student/finance/balance"),
        fetch("http://localhost:5000/api/student/finance/payment-schedule"),
      ]);

      const [balanceData, scheduleData] = await Promise.all([
        balanceRes.json(),
        scheduleRes.json(),
      ]);

      if (balanceData.success) setBalance(balanceData.data);
      if (scheduleData.success) setPaymentSchedule(scheduleData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedule = paymentSchedule.filter((item) =>
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSchedule.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredSchedule.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    const colors = {
      paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      partial: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      pending: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign size={24} className="text-indigo-600" />
            Tuition Balance
          </h2>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-5 text-white shadow-lg">
            <p className="text-xs font-medium text-indigo-100 uppercase mb-1">Total Tuition Fee</p>
            <p className="text-3xl font-bold">₱{parseFloat(balance?.total_tuition || 0).toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
            <p className="text-xs font-medium text-green-100 uppercase mb-1">Total Paid</p>
            <p className="text-3xl font-bold">₱{parseFloat(balance?.total_paid || 0).toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-5 text-white shadow-lg">
            <p className="text-xs font-medium text-red-100 uppercase mb-1">Remaining Balance</p>
            <p className="text-3xl font-bold">₱{parseFloat(balance?.remaining_balance || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <input
            type="text"
            placeholder="Search payment schedule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white text-sm"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        </div>

        {/* Payment Schedule Table */}
        <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-700/70">
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <th className="px-4 py-2.5">Due Date</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Paid Amount</th>
                <th className="px-4 py-2.5">Balance</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No payment schedule found
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.schedule_id} className="text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50/50 dark:hover:bg-slate-700">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(item.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-2 font-medium">{item.description}</td>
                    <td className="px-4 py-2">₱{parseFloat(item.amount).toLocaleString()}</td>
                    <td className="px-4 py-2">₱{parseFloat(item.paid_amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 font-semibold">₱{parseFloat(item.amount - (item.paid_amount || 0)).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
            Page {currentPage} of {totalPages || 1} | Total: {filteredSchedule.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFinanceBalance;
