import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
} from "react-icons/fi";

const DailyLog = () => {
  const [transactions, setTransactions] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState({ totalDebit: 0, totalCredit: 0 });

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/mobileAccounts/today-log",
        {
          params: {
            page: currentPage,
          },
        }
      );

      // Set transactions from the response
      setTransactions(response.data.data.transactions);

      // Set summary data
      setSummary(response.data.data.summary);

      // Set pagination data
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Format date for better display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="text-center mb-10 mt-10">
        <h1 className="text-4xl font-bold">Daily Transaction Logs</h1>
      </div>

      {/* Summary Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Credit</p>
            <p className="text-2xl font-bold text-green-600">
              {summary.totalCredit}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Debit</p>
            <p className="text-2xl font-bold text-red-600">
              {summary.totalDebit}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-6 text-gray-500 font-medium">
                Company
              </th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium">
                Account
              </th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-center">
                Amount
              </th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-center">
                Type
              </th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium">
                Remarks
              </th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium">
                Entry By
              </th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-center">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr
                key={transaction._id}
                className={`border-b border-gray-200 ${
                  index % 2 === 1 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="py-4 px-6">
                  <div className="font-semibold text-gray-900">
                    {transaction.company}
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {transaction.selectedAccount}
                </td>
                <td
                  className={`py-4 px-6 text-center font-medium ${
                    transaction.isDebit ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {transaction.isDebit
                    ? `-${Math.abs(transaction.amount)}`
                    : `+${transaction.newAmount || transaction.amount}`}
                </td>
                <td className="py-4 px-6 text-center">
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      transaction.isDebit
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {transaction.isDebit ? "Debit" : "Credit"}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {transaction.remarks}
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {transaction.entryBy}
                </td>
                <td className="py-4 px-6 text-gray-700 text-center">
                  {formatDate(transaction.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white ${
                      transaction.isDebit ? "bg-red-500" : "bg-green-500"
                    }`}
                  >
                    {transaction.isDebit ? "-" : "+"}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {transaction.company}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.selectedAccount}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div
                    className={`font-semibold ${
                      transaction.isDebit ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {transaction.isDebit
                      ? `-${Math.abs(transaction.amount)}`
                      : `+${transaction.newAmount || transaction.amount}`}
                  </div>
                  <button
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === transaction._id ? null : transaction._id
                      )
                    }
                    className="text-gray-500 mt-1"
                  >
                    {expandedRow === transaction._id ? (
                      <FiChevronUp size={20} />
                    ) : (
                      <FiChevronDown size={20} />
                    )}
                  </button>
                </div>
              </div>

              {expandedRow === transaction._id && (
                <div className="mt-4 space-y-3 pt-3 border-t border-gray-200">
                  {transaction.customerName && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Customer:</div>
                      <div className="text-sm text-gray-900">
                        {transaction.customerName}
                      </div>
                    </div>
                  )}
                  {transaction.customerNumber && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Customer No:</div>
                      <div className="text-sm text-gray-900">
                        {transaction.customerNumber}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Type:</div>
                    <div className="text-sm">
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          transaction.isDebit
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {transaction.isDebit ? "Debit" : "Credit"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Remarks:</div>
                    <div className="text-sm text-gray-900">
                      {transaction.remarks}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Statement:</div>
                    <div className="text-sm text-gray-900">
                      {transaction.statement}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Entry By:</div>
                    <div className="text-sm text-gray-900">
                      {transaction.entryBy}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Date:</div>
                    <div className="text-sm text-gray-900">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center items-center space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <FiChevronLeft />
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default DailyLog;
