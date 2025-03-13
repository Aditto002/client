import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiInfo,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const Toast = ({ message, type, onClose }) => {
  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  const Icon =
    type === "success" ? FiCheck : type === "error" ? FiAlertCircle : FiInfo;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 rounded-lg shadow-lg ${bgColor} text-white min-w-64 max-w-xs`}
    >
      <div className="mr-2">
        <Icon size={20} />
      </div>
      <div className="flex-1">{message}</div>
      <button onClick={onClose} className="ml-2">
        <FiX size={18} />
      </button>
    </div>
  );
};

const DuePage = () => {
  const navigate = useNavigate();

  // States
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customersTotal, setCustomersTotal] = useState(0);
  const [customersCurrentPage, setCustomersCurrentPage] = useState(1);
  const [customersTotalPages, setCustomersTotalPages] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Fetch customers when search query or page changes
  useEffect(() => {
    fetchCustomers();
  }, [searchQuery, customersCurrentPage]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Function to show toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Function to fetch customers from the API
  const fetchCustomers = async () => {
    try {
      setIsSearching(true);
      const params = {
        page: customersCurrentPage,
        limit: 10, // Default limit, can be changed if needed
      };

      // Only add search parameter if it has a value
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get(
        "https://bebsa.ahadalichowdhury.online/api/customers",
        {
          params: params,
        }
      );

      setCustomers(response.data.data);
      // If pagination is available in the response, use it
      if (response.data.pagination) {
        setCustomersTotal(response.data.pagination.totalRecords);
        setCustomersTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      showToast("Failed to load customers", "error");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCustomersCurrentPage(1); // Reset to first page when search changes
  };

  // Handle Due button click - updated to use GET request
  const handleDueClick = async (mobileNumber) => {
    try {
      const dueUrl = `/due?mobileNumber=${mobileNumber}`;

      // Open the statement page in a new tab
      window.open(dueUrl, "_blank");
    } catch (error) {
      console.error("Error processing due transaction:", error);
      showToast("Failed to process due request", "error");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="text-center mb-10 mt-10">
        <h1 className="text-4xl font-bold">Customers</h1>
      </div>

      <div className="flex items-center justify-center mb-6">
        {/* Search Input with Icon */}
        <div className="relative w-full max-w-md">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FiSearch size={18} />
          </div>
          <input
            type="search"
            placeholder="Search by name or number..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 p-3 border rounded w-full"
          />
        </div>
      </div>

      {isSearching && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Customer List Section */}
      <div className="mt-8">
        {/* Desktop View for Customers */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-gray-500 font-medium">
                  Customer Name
                </th>
                <th className="text-left py-4 px-6 text-gray-500 font-medium">
                  Mobile Number
                </th>
                
                <th className="text-center py-4 px-6 text-gray-500 font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr
                  key={customer._id}
                  className={`border-b border-gray-200 ${
                    index % 2 === 1 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-gray-900">
                        {customer.customerName}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {customer.mobileNumber}
                  </td>
                  
                  <td className="py-4 px-6 text-center">
                    <button
                      className="bg-blue-500 py-2 px-4 rounded text-white hover:bg-blue-600 transition-colors"
                      onClick={() => handleDueClick(customer.mobileNumber)}
                    >
                      Due
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View for Customers */}
        <div className="md:hidden space-y-4">
          {customers.map((customer) => (
            <div
              key={customer._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {customer.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.mobileNumber}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === customer._id ? null : customer._id
                      )
                    }
                    className="text-gray-500"
                  >
                    {expandedRow === customer._id ? (
                      <FiChevronUp size={20} />
                    ) : (
                      <FiChevronDown size={20} />
                    )}
                  </button>
                </div>

                {expandedRow === customer._id ? (
                  <div className="mt-4 space-y-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">
                        Customer Name:
                      </div>
                      <div className="text-sm text-gray-900">
                        {customer.customerName}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">
                        Mobile Number:
                      </div>
                      <div className="text-sm text-gray-900">
                        {customer.mobileNumber}
                      </div>
                    </div> <div className="pt-3 flex justify-center">
                      <button
                        className="bg-blue-500 py-2 px-4 rounded text-white hover:bg-blue-600 transition-colors w-full"
                        onClick={() => handleDueClick(customer.mobileNumber)}
                      >
                        Due
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex justify-end">
                    <button
                      className="bg-blue-500 py-1 px-3 rounded text-white hover:bg-blue-600 transition-colors text-sm"
                      onClick={() => handleDueClick(customer.mobileNumber)}
                    >
                      Due
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <Link
            to="/"
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
          >
            Back
          </Link>

          {customers.length > 0 && customersTotalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() =>
                  setCustomersCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={customersCurrentPage === 1}
                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>
              <span>
                Page {customersCurrentPage} of {customersTotalPages}
              </span>
              <button
                onClick={() =>
                  setCustomersCurrentPage((prev) =>
                    Math.min(prev + 1, customersTotalPages)
                  )
                }
                disabled={customersCurrentPage === customersTotalPages}
                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuePage;
