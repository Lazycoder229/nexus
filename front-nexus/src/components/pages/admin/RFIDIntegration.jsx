import { useState, useEffect } from "react";
import { CreditCard, Users, Plus, Search, Edit, X } from "lucide-react";

const RFIDIntegration = () => {
  const [rfidCards, setRfidCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    card_type: "",
    status: "",
  });

  useEffect(() => {
    fetchRfidCards();
  }, []);

  const fetchRfidCards = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        search: searchTerm,
      });
      const response = await fetch(
        `http://localhost:5000/api/rfid-cards?${queryParams}`
      );
      const data = await response.json();
      if (data.success) {
        setRfidCards(data.data);
      }
    } catch (error) {
      console.error("Error fetching RFID cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRfidCards();
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      lost: "bg-red-100 text-red-800",
      damaged: "bg-yellow-100 text-yellow-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const getCardTypeBadge = (type) => {
    const typeColors = {
      student: "bg-blue-100 text-blue-800",
      faculty: "bg-purple-100 text-purple-800",
      staff: "bg-indigo-100 text-indigo-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          typeColors[type] || "bg-gray-100 text-gray-800"
        }`}
      >
        {type}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">RFID Card Integration</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Register New Card
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Cards</h3>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">1,376</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Cards</h3>
            <CreditCard className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">1,295</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Inactive</h3>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">58</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Lost/Damaged</h3>
            <CreditCard className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold">23</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          Search & Filter RFID Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <input
              type="text"
              placeholder="Search by card number or user name..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={filters.card_type}
            onChange={(e) =>
              setFilters({ ...filters, card_type: e.target.value })
            }
          >
            <option value="">All Types</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="staff">Staff</option>
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="lost">Lost</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>
        <div className="mt-4">
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      {/* RFID Cards Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">RFID Card Registry</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Card Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Identifier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Card Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : rfidCards.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No RFID cards found
                  </td>
                </tr>
              ) : (
                rfidCards.map((card) => (
                  <tr key={card.rfid_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {card.card_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {card.user_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {card.user_identifier || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCardTypeBadge(card.card_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(card.issue_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {card.expiry_date
                        ? new Date(card.expiry_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(card.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {card.last_used
                        ? new Date(card.last_used).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RFIDIntegration;
