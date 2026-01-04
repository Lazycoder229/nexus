import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

const PaymentGateway = () => {
  const [gateways, setGateways] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    gateway_name: "",
    transaction_status: "",
    start_date: "",
    end_date: "",
    search: "",
  });

  const [gatewayForm, setGatewayForm] = useState({
    gateway_id: null,
    gateway_name: "PayMaya",
    api_key: "",
    api_secret: "",
    merchant_id: "",
    is_active: true,
    is_test_mode: true,
    webhook_url: "",
    success_url: "",
    cancel_url: "",
    transaction_fee_percentage: 2.5,
    fixed_transaction_fee: 0,
    settings: "",
  });

  const gatewayProviders = [
    "PayMaya",
    "GCash",
    "PayPal",
    "Stripe",
    "Paynamics",
    "DragonPay",
    "PayMongo",
  ];

  const transactionStatuses = [
    "Pending",
    "Processing",
    "Success",
    "Failed",
    "Refunded",
  ];

  useEffect(() => {
    fetchGateways();
    fetchTransactions();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchGateways = async () => {
    try {
      const response = await axios.get("/api/payment-gateway/config");
      setGateways(response.data.data || []);
    } catch (error) {
      console.error("Error fetching gateways:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/api/payment-gateway/transactions", {
        params: filters,
      });
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get("/api/payment-gateway/summary", {
        params: {
          start_date: filters.start_date,
          end_date: filters.end_date,
          gateway_name: filters.gateway_name,
        },
      });
      setSummary(response.data.data || {});
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const handleGatewaySubmit = async (e) => {
    e.preventDefault();
    try {
      if (gatewayForm.gateway_id) {
        await axios.put(
          `/api/payment-gateway/config/${gatewayForm.gateway_id}`,
          gatewayForm
        );
      } else {
        await axios.post("/api/payment-gateway/config", gatewayForm);
      }
      setShowGatewayModal(false);
      resetGatewayForm();
      fetchGateways();
      alert("Gateway configuration saved!");
    } catch (error) {
      console.error("Error saving gateway:", error);
      alert("Failed to save gateway configuration");
    }
  };

  const handleEditGateway = (gateway) => {
    setGatewayForm(gateway);
    setShowGatewayModal(true);
  };

  const handleDeleteGateway = async (id) => {
    if (window.confirm("Delete this gateway configuration?")) {
      try {
        await axios.delete(`/api/payment-gateway/config/${id}`);
        fetchGateways();
      } catch (error) {
        console.error("Error deleting gateway:", error);
      }
    }
  };

  const handleVerifyTransaction = async (id) => {
    try {
      await axios.post(`/api/payment-gateway/transactions/${id}/verify`);
      fetchTransactions();
      fetchSummary();
      alert("Transaction verified!");
    } catch (error) {
      console.error("Error verifying transaction:", error);
      alert("Failed to verify transaction");
    }
  };

  const resetGatewayForm = () => {
    setGatewayForm({
      gateway_id: null,
      gateway_name: "PayMaya",
      api_key: "",
      api_secret: "",
      merchant_id: "",
      is_active: true,
      is_test_mode: true,
      webhook_url: "",
      success_url: "",
      cancel_url: "",
      transaction_fee_percentage: 2.5,
      fixed_transaction_fee: 0,
      settings: "",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payment Gateway</h1>
          <p className="text-gray-600 mt-1">
            Configure and monitor online payment gateways
          </p>
        </div>
        <button
          onClick={() => {
            resetGatewayForm();
            setShowGatewayModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Gateway
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Processed</p>
          <p className="text-2xl font-bold text-blue-600">
            ₱{parseFloat(summary.total_amount || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Successful</p>
          <p className="text-2xl font-bold text-green-600">
            ₱{parseFloat(summary.successful_amount || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">
            ₱{parseFloat(summary.failed_amount || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Transactions</p>
          <p className="text-2xl font-bold text-gray-800">
            {summary.total_transactions || 0}
          </p>
        </div>
      </div>

      {/* Gateway Configurations */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="text-blue-600" />
          Gateway Configurations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gateways.map((gateway) => (
            <div
              key={gateway.gateway_id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-blue-600" size={24} />
                  <h3 className="font-bold text-lg">{gateway.gateway_name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditGateway(gateway)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteGateway(gateway.gateway_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      gateway.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {gateway.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mode:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      gateway.is_test_mode
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {gateway.is_test_mode ? "Test" : "Live"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction Fee:</span>
                  <span className="font-semibold">
                    {gateway.transaction_fee_percentage}% + ₱
                    {parseFloat(gateway.fixed_transaction_fee).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Merchant ID:</span>
                  <span className="font-mono text-xs truncate max-w-[150px]">
                    {gateway.merchant_id || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <select
              value={filters.gateway_name}
              onChange={(e) =>
                setFilters({ ...filters, gateway_name: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Gateways</option>
              {gatewayProviders.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.transaction_status}
              onChange={(e) =>
                setFilters({ ...filters, transaction_status: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Status</option>
              {transactionStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) =>
                setFilters({ ...filters, start_date: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) =>
                setFilters({ ...filters, end_date: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div>
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Gateway
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.transaction_id}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                    {transaction.gateway_transaction_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium">
                        {transaction.student_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.student_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-blue-600" />
                      {transaction.gateway_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">
                    ₱{parseFloat(transaction.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(transaction.transaction_date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {transaction.transaction_status === "Success" && (
                        <CheckCircle size={16} className="text-green-600" />
                      )}
                      {transaction.transaction_status === "Failed" && (
                        <XCircle size={16} className="text-red-600" />
                      )}
                      {(transaction.transaction_status === "Pending" ||
                        transaction.transaction_status === "Processing") && (
                        <Clock size={16} className="text-yellow-600" />
                      )}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          transaction.transaction_status === "Success"
                            ? "bg-green-100 text-green-800"
                            : transaction.transaction_status === "Failed"
                            ? "bg-red-100 text-red-800"
                            : transaction.transaction_status === "Refunded"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.transaction_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.transaction_status === "Pending" && (
                      <button
                        onClick={() =>
                          handleVerifyTransaction(transaction.transaction_id)
                        }
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gateway Configuration Modal */}
      {showGatewayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold mb-4">
              {gatewayForm.gateway_id ? "Edit" : "Add"} Gateway Configuration
            </h2>
            <form onSubmit={handleGatewaySubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gateway Provider *
                  </label>
                  <select
                    value={gatewayForm.gateway_name}
                    onChange={(e) =>
                      setGatewayForm({
                        ...gatewayForm,
                        gateway_name: e.target.value,
                      })
                    }
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {gatewayProviders.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Merchant ID
                  </label>
                  <input
                    type="text"
                    value={gatewayForm.merchant_id}
                    onChange={(e) =>
                      setGatewayForm({
                        ...gatewayForm,
                        merchant_id: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    API Key *
                  </label>
                  <input
                    type="text"
                    value={gatewayForm.api_key}
                    onChange={(e) =>
                      setGatewayForm({
                        ...gatewayForm,
                        api_key: e.target.value,
                      })
                    }
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    API Secret *
                  </label>
                  <input
                    type="password"
                    value={gatewayForm.api_secret}
                    onChange={(e) =>
                      setGatewayForm({
                        ...gatewayForm,
                        api_secret: e.target.value,
                      })
                    }
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Fee Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={gatewayForm.transaction_fee_percentage}
                    onChange={(e) =>
                      setGatewayForm({
                        ...gatewayForm,
                        transaction_fee_percentage: e.target.value,
                      })
                    }
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Fixed Fee (₱)
                  </label>
                  <input
                    type="number"
                    value={gatewayForm.fixed_transaction_fee}
                    onChange={(e) =>
                      setGatewayForm({
                        ...gatewayForm,
                        fixed_transaction_fee: e.target.value,
                      })
                    }
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={gatewayForm.webhook_url}
                    onChange={(e) =>
                      setGatewayForm({
                        ...gatewayForm,
                        webhook_url: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Success URL
                  </label>
                  <input
                    type="url"
                    value={gatewayForm.success_url}
                    onChange={(e) =>
                      setGatewayForm({
                        ...gatewayForm,
                        success_url: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cancel URL
                  </label>
                  <input
                    type="url"
                    value={gatewayForm.cancel_url}
                    onChange={(e) =>
                      setGatewayForm({
                        ...gatewayForm,
                        cancel_url: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={gatewayForm.is_active}
                      onChange={(e) =>
                        setGatewayForm({
                          ...gatewayForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={gatewayForm.is_test_mode}
                      onChange={(e) =>
                        setGatewayForm({
                          ...gatewayForm,
                          is_test_mode: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Test Mode</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowGatewayModal(false);
                    resetGatewayForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentGateway;
