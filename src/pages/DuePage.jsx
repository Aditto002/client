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
  FiUser,
  FiPhone,
  FiDownload,
  FiPlus,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-xl ${bgColor} text-white min-w-64 max-w-xs animate-fade-in-down`}
    >
      <div className="mr-3 flex items-center justify-center">
        <Icon size={20} />
      </div>
      <div className="flex-1 font-medium">{message}</div>
      <button onClick={onClose} className="ml-2 hover:text-gray-200 transition-colors">
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [PDFData, setPDFData] = useState([]);
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
      console.log("data ", response.data.data);

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

  // Function to fetch all customers for PDF
  const fetchAllCustomersForPDF = async () => {
    try {
      setIsDownloading(true);
      // First try to get all customers
      const response = await axios.get(
        "https://bebsa.ahadalichowdhury.online/api/customers/all"
      );
      
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching all customers:", error);
      
      // If the /all endpoint fails, try using the paginated endpoint with a large limit
      try {
        console.log("Trying alternative approach with pagination");
        const paginatedResponse = await axios.get(
          "https://bebsa.ahadalichowdhury.online/api/customers",
          {
            params: {
              page: 1,
              limit: 1000 // Request a large number of customers
            }
          }
        );
        
        if (paginatedResponse.data && Array.isArray(paginatedResponse.data.data)) {
          return paginatedResponse.data.data;
        } else {
          throw new Error("Invalid data format from paginated endpoint");
        }
      } catch (secondError) {
        console.error("Both endpoints failed:", secondError);
        showToast("Failed to fetch customers for PDF", "error");
        throw new Error("Could not fetch customer data from any endpoint");
      }
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

  // Function to download PDF of all customers
  const downloadCustomersPDF = async () => {
    try {
      console.log("Download PDF function called");
      setIsDownloading(true);
      
      // Fetch all customers for PDF
      const allCustomers = await fetchAllCustomersForPDF();
      console.log("Fetched customers for PDF:", allCustomers?.length || 0);
      
      if (!allCustomers || allCustomers.length === 0) {
        console.error("No customer data available to download");
        showToast("No customer data available to download", "error");
        return;
      }
      
      // Initialize jsPDF - use portrait orientation
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add content to PDF (your existing code)
      doc.setFontSize(18);
      const title = "Deb Telecom";
      doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, 22);
      
      // Rest of your PDF generation code...
      
      // Format customer data for the table
      const tableData = allCustomers.map((customer, index) => [
        index + 1,
        customer.customerName || '',
        customer.mobileNumber || '',
      ]);
      
      // Add the table
      autoTable(doc, {
        startY: 60,
        head: [["S.No", "Customer Name", "Mobile Number"]],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 48 },
      });
      
      // Save the PDF - this line is critical
      const fileName = `customers_list_${new Date().toISOString().split('T')[0]}.pdf`;
      console.log("Attempting to save PDF with filename:", fileName);
      
      // Try using this more direct approach:
      doc.save(fileName);
      
      console.log("PDF download complete");
      showToast("Customer list downloaded successfully", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Error generating PDF: " + error.message, "error");
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle create new customer
  const handleCreateCustomer = () => {
    navigate("/customer/create");
  };

  return (
    <div className="bg-gray-50 min-h-screen bg-slate-200">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}

        <div className="flex justify-between items-center mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Customers</h1>
            <div className="h-1 w-24 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleCreateCustomer}
              className="bg-red-500 py-2 px-4 rounded-lg text-white hover:bg-red-600 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              {/* <FiPlus size={16} /> */}
              Due History
            </button>
            <button
              onClick={downloadCustomersPDF}
              disabled={isDownloading}
              className="bg-blue-500 py-2 px-4 rounded-lg text-white hover:bg-blue-600 transition-colors font-medium shadow-sm flex items-center gap-2 disabled:bg-blue-300"
            >
              {isDownloading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
              ) : (
                <FiDownload size={16} />
              )}
              {isDownloading ? "Downloading..." : "Download PDF"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div> </div>
            {/* Search Input with Icon */}
            <div className="relative w-full max-w-lg">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiSearch size={20} />
              </div>
              <input
                type="search"
                placeholder="Search by name or number..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-12 p-4 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={handleCreateCustomer}
              className="bg-green-500 md:ml-10 py-2 px-4 rounded-lg text-white hover:bg-green-600 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              <FiPlus size={16} />
              Create
            </button>
          </div>

          {isSearching && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Customer List Section */}
          <div className="mt-8">
            {/* Desktop View for Customers */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold shadow-md">
                      Customer Name
                    </th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold shadow-md">
                      Mobile Number
                    </th>
                    <th className="text-center py-4 px-6 text-gray-600 font-semibold shadow-md">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr
                      key={customer._id}
                      className="border-t border-gray-200 hover:bg-blue-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 text-blue-500 p-2 rounded-full">
                            <FiUser size={16} />
                          </div>
                          <div className="font-medium text-gray-800">
                            {customer.customerName}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiPhone size={16} className="text-gray-400" />
                          {customer.mobileNumber}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          className="bg-blue-500 py-2 px-6 rounded-lg text-white hover:bg-blue-600 transition-colors font-medium shadow-sm hover:shadow-md"
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
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-200 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-500 p-2 rounded-full">
                          <FiUser size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {customer.customerName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <FiPhone size={14} />
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
                        className="text-gray-500 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {expandedRow === customer._id ? (
                          <FiChevronUp size={18} />
                        ) : (
                          <FiChevronDown size={18} />
                        )}
                      </button>
                    </div>

                    {expandedRow === customer._id ? (
                      <div className="mt-4 space-y-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-gray-500">
                            Customer Name:
                          </div>
                          <div className="text-sm font-medium text-gray-800">
                            {customer.customerName}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-gray-500">
                            Mobile Number:
                          </div>
                          <div className="text-sm font-medium text-gray-800">
                            {customer.mobileNumber}
                          </div>
                        </div>
                        <div className="pt-3 flex justify-center">
                          <button
                            className="bg-blue-500 py-2.5 px-6 rounded-lg text-white hover:bg-blue-600 transition-colors w-full font-medium shadow-sm"
                            onClick={() => handleDueClick(customer.mobileNumber)}
                          >
                            Due
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 flex justify-end">
                        <button
                          className="bg-blue-500 py-1.5 px-4 rounded-lg text-white hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
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

            {/* Empty State */}
            {customers.length === 0 && !isSearching && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No customers found</p>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-8">
              <Link
                to="/"
                className="bg-gray-600 text-white px-6 py-2.5 rounded-lg hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <FiChevronLeft size={16} />
                Back
              </Link>

              {customers.length > 0 && customersTotalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <button
                    onClick={() =>
                      setCustomersCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={customersCurrentPage === 1}
                    className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    <FiChevronLeft />
                  </button>
                  <span className="text-gray-700 font-medium px-2">
                    Page {customersCurrentPage} of {customersTotalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCustomersCurrentPage((prev) =>
                        Math.min(prev + 1, customersTotalPages)
                      )
                    }
                    disabled={customersCurrentPage === customersTotalPages}
                    className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuePage;