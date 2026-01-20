import React from "react";
import { LayoutDashboard, DollarSign, FileText, Award } from "lucide-react";

export default function AccountingDashboard() {
  return (
    <div className="h-[80vh] font-sans text-gray-800">
      <main className="p-4">
        <div className="space-y-4">
          {/* Dashboard Header */}
          <div className="border-b-4 border-indigo-600 pb-4">
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="w-8 h-8 text-indigo-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return "Good Morning, Accounting";
                  else if (hour < 18) return "Good Afternoon, Accounting";
                  else return "Good Evening, Accounting";
                })()}
              </h2>
            </div>
            <p className="mt-1 text-gray-500 text-base">
              Overview of financial operations, billing, and scholarships.
            </p>
          </div>
          {/* Stats */}
          <h3 className="text-xl font-bold text-gray-700">
            Key Performance Indicators
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Total Revenue
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    ₱0.00
                  </h2>
                </div>
                <div className="p-3 rounded-full bg-green-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="mt-2 text-[10px] font-semibold text-gray-500">
                Current fiscal year
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Invoices Issued
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">0</h2>
                </div>
                <div className="p-3 rounded-full bg-indigo-600 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="mt-2 text-[10px] font-semibold text-gray-500">
                This month
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Scholarships Disbursed
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    ₱0.00
                  </h2>
                </div>
                <div className="p-3 rounded-full bg-yellow-600 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="mt-2 text-[10px] font-semibold text-gray-500">
                Year to date
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
