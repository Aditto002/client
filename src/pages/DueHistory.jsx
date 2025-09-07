import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const DueHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState({ totalGiven: 0, totalTaken: 0 });

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        "https://bebsa-backend.vercel.app/api/due-history",
        {
          params: {
            page: currentPage,
          },
        }
      );

      // Set transactions from the response
      setTransactions(response.data.transactions || []);

      // Set summary data
      setSummary({
        totalGiven: response.data.totalGivenToday || 0,
        totalTaken: response.data.totalTakenToday || 0,
      });

      // Set pagination data - calculate total pages if not provided by API
      const itemsPerPage = 10; // Adjust based on your API's pagination
      const totalItems = response.data.transactions?.length || 0;
      setTotalPages(
        response.data.totalPages || Math.ceil(totalItems / itemsPerPage) || 1
      );
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
        <h1 className="text-4xl font-bold">Due History</h1>
      </div>

      {/* Summary Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Given</p>
            <p className="text-2xl font-bold  text-red-600">
              {summary.totalGiven}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Taken</p>
            <p className="text-2xl font-bold text-green-600">
              {summary.totalTaken}
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
                Customer
              </th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-center">
                দিয়েছি
              </th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-center">
                নিয়েছি
              </th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-center">
                Balance
              </th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium">
                Notes
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
                    {transaction.user.customerName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {transaction.user.mobileNumber}
                  </div>
                </td>
                <td className="py-4 px-6 text-center text-gray-700 bg-red-50">
                  {transaction.given > 0 ? (
                    <span className="text-red-600 font-medium">
                      {transaction.given}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-4 px-6 text-center text-gray-700 bg-green-50">
                  {transaction.taken > 0 ? (
                    <span className="text-green-600  font-medium">
                      {transaction.taken}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td
                  className={`py-4 px-6 text-center font-medium ${transaction.balance}`}
                >
                  {transaction.balance}
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {transaction.notes || "-"}
                </td>
                <td className="py-4 px-6 text-gray-700 text-center">
                  {formatDate(transaction.date)}
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
                      transaction.taken > 0 ? "bg-red-500" : "bg-green-500"
                    }`}
                  >
                    {transaction.taken > 0 ? "-" : "+"}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {transaction.user.customerName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.user.mobileNumber}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div
                    className={`font-semibold ${
                      transaction.taken > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {transaction.taken > 0
                      ? `-${transaction.taken}`
                      : `+${transaction.given}`}
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
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Given:</div>
                    <div className="text-sm text-green-600 font-medium">
                      {transaction.given}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Taken:</div>
                    <div className="text-sm text-red-600 font-medium">
                      {transaction.taken}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Balance:</div>
                    <div
                      className={`text-sm font-medium ${
                        transaction.balance < 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {transaction.balance}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Notes:</div>
                    <div className="text-sm text-gray-900">
                      {transaction.notes || "-"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Date:</div>
                    <div className="text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Customer Due:</div>
                    <div
                      className={`text-sm font-medium ${
                        transaction.user.dueBalance < 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {transaction.user.dueBalance}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="bg-gray-500 mt-5 text-white px-6 py-2 rounded-md hover:bg-gray-600"
        >
          Back
        </Link>
        <div>
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
      </div>
    </div>
  );
};

export default DueHistory;
