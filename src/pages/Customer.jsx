import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiEdit,
  FiInfo,
  FiSearch,
  FiTrash,
  FiX,
} from "react-icons/fi";
import { Link } from "react-router-dom";

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

const Customer = () => {
  const getFormattedDate = (date) => {
    return date ? new Date(date).toISOString().split("T")[0] : "";
  };
  const [transactions, setTransactions] = useState([]);
  const [PDFData, setPDFData] = useState([]);
  const [totalAmount, setTotalAmount] = useState({ totalAmount: 0 });
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [startDate, setStartDate] = useState(""); // Initialize with empty string
  const [endDate, setEndDate] = useState(""); // Initialize with empty string
  const [tempStartDate, setTempStartDate] = useState(""); // Initialize with empty string
  const [tempEndDate, setTempEndDate] = useState(""); // Initialize with empty string

  // State for create modal
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // State for update modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateCustomerId, setUpdateCustomerId] = useState("");
  const [updateCustomerName, setUpdateCustomerName] = useState("");
  const [updateMobileNumber, setUpdateMobileNumber] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCustomerId, setDeleteCustomerId] = useState("");
  const [deleteCustomerName, setDeleteCustomerName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // New state for customer search and results
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customersTotal, setCustomersTotal] = useState(0);
  const [customersCurrentPage, setCustomersCurrentPage] = useState(1);
  const [customersTotalPages, setCustomersTotalPages] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, startDate, endDate]);

  useEffect(() => {
    // Fetch customers when search query or page changes
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

  const fetchTransactions = async () => {
    try {
      // Prepare params object, only including dates if they have values
      const params = {
        page: currentPage,
      };

      // Only add date parameters if they're not empty
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(
        "https://bebsa-backend.vercel.app/api/mobileAccounts",
        {
          params: params,
        }
      );
      setTransactions(response.data.data.accounts);
      setTotalAmount(response.data.data);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
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
        "https://bebsa-backend.vercel.app/api/customers",
        {
          params: params,
        }
      );

      setCustomers(response.data.data);
      setCustomersTotal(response.data.pagination.totalRecords);
      setCustomersTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCustomersCurrentPage(1); // Reset to first page when search changes
  };

  const handleApplyFilters = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1); // Reset pagination to first page
    fetchTransactions(); // Fetch with applied filters
  };

  // Function to handle customer creation
  const handleCreateCustomer = async () => {
    // Validate inputs
    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }

    if (!mobileNumber.trim()) {
      setError("Mobile number is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await axios.post(
        "https://bebsa-backend.vercel.app/api/customers",
        {
          customerName,
          mobileNumber,
        }
      );

      console.log("Customer created:", response.data);

      // Close modal and reset form
      setShowModal(false);
      setCustomerName("");
      setMobileNumber("");

      // Show success toast
      showToast(`Customer ${customerName} created successfully!`, "success");

      // Refresh customers list
      fetchCustomers();
    } catch (error) {
      console.error("Error creating customer:", error);
      setError(
        error.response?.data?.message ||
          "Failed to create customer. Please try again."
      );
      showToast("Failed to create customer", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to open update modal with pre-filled values
  const openUpdateModal = (customer) => {
    setUpdateCustomerId(customer._id);
    setUpdateCustomerName(customer.customerName);
    setUpdateMobileNumber(customer.mobileNumber);
    setUpdateError("");
    setShowUpdateModal(true);
  };

  // Function to handle customer update
  const handleUpdateCustomer = async () => {
    // Validate inputs
    if (!updateCustomerName.trim()) {
      setUpdateError("Customer name is required");
      return;
    }

    if (!updateMobileNumber.trim()) {
      setUpdateError("Mobile number is required");
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError("");

      const response = await axios.put(
        `https://bebsa-backend.vercel.app/api/customers/${updateCustomerId}`,
        {
          customerName: updateCustomerName,
          mobileNumber: updateMobileNumber,
        }
      );

      console.log("Customer updated:", response.data);

      // Close modal and reset form
      setShowUpdateModal(false);
      setUpdateCustomerId("");
      setUpdateCustomerName("");
      setUpdateMobileNumber("");

      // Show success toast
      showToast(
        `Customer ${updateCustomerName} updated successfully!`,
        "success"
      );

      // Refresh customers list
      fetchCustomers();
    } catch (error) {
      console.error("Error updating customer:", error);
      setUpdateError(
        error.response?.data?.message ||
          "Failed to update customer. Please try again."
      );
      showToast("Failed to update customer", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to open delete confirmation modal
  const openDeleteModal = (customer) => {
    setDeleteCustomerId(customer._id);
    setDeleteCustomerName(customer.customerName);
    setShowDeleteModal(true);
  };

  // Function to handle customer deletion
  const handleDeleteCustomer = async () => {
    try {
      setIsDeleting(true);

      await axios.delete(
        `https://bebsa-backend.vercel.app/api/customers/${deleteCustomerId}`
      );

      console.log("Customer deleted successfully");

      // Show success toast
      showToast(
        `Customer ${deleteCustomerName} deleted successfully!`,
        "success"
      );

      // Close modal and reset state
      setShowDeleteModal(false);
      setDeleteCustomerId("");
      setDeleteCustomerName("");

      // Refresh customers list
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      showToast("Failed to delete customer", "error");
    } finally {
      setIsDeleting(false);
    }
  };
  const downloadCustomersPDF = () => {
    try {
      console.log("Download PDF function called");

      // Check if customers exist before proceeding
      if (!customers || customers.length === 0) {
        console.error("No customer data available to download");
        showToast("No customer data available to download", "error");
        return;
      }

      // Initialize jsPDF - use portrait orientation
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(18);

      // Center "Deb Telecom"
      const title = "Deb Telecom";
      doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, 22);

      // Center "Moulvibazar Road, Afrozganj Bazar Sherpur"
      const address = "Moulvibazar Road, Afrozganj Bazar Sherpur";
      doc.text(address, (pageWidth - doc.getTextWidth(address)) / 2, 30);

      // Center "Customer Register"
      const subtitle = "Customer Register";
      doc.text(subtitle, (pageWidth - doc.getTextWidth(subtitle)) / 2, 38);

      // Add report metadata
      doc.setFontSize(11);

      const searchQueryText = searchQuery
        ? `Search Query: ${searchQuery}`
        : "All Customers";
      doc.text(
        searchQueryText,
        (pageWidth - doc.getTextWidth(searchQueryText)) / 2,
        48
      );

      const totalCustomersText = `Total Customers: ${customersTotal || 0}`;
      doc.text(
        totalCustomersText,
        (pageWidth - doc.getTextWidth(totalCustomersText)) / 2,
        54
      );

      const generatedText = `Generated on: ${new Date().toLocaleString()}`;
      doc.text(
        generatedText,
        (pageWidth - doc.getTextWidth(generatedText)) / 2,
        60
      );

      // Format customer data for the table
      const tableData = customers.map((customer) => [
        customer.customerName || "",
        customer.mobileNumber || "",
        new Date(customer.createdAt).toLocaleDateString() || "",
      ]);

      // Define table columns
      const headers = ["Customer Name", "Mobile Number", "Created Date"];

      // Add customers table with auto table and capture the final Y position
      let finalY;
      autoTable(doc, {
        startY: 70,
        head: [headers],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [66, 66, 66] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 48 },
        didDrawPage: (data) => {
          finalY = data.cursor.y; // This captures the Y position after the table is drawn
        },
      });

      // Add horizontal line after the table
      doc.setDrawColor(0); // Black color
      doc.setLineWidth(0.5); // Line width
      doc.line(10, finalY + 10, pageWidth - 10, finalY + 10); // Draw line

      // Add total customers text below the line
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const grandTotalText = `Total Customers: ${customersTotal || 0}`;
      doc.text(
        grandTotalText,
        pageWidth - 20 - doc.getTextWidth(grandTotalText),
        finalY + 20
      ); // Right-aligned

      // Save the PDF
      const fileName = searchQuery
        ? `customers_search_${searchQuery}.pdf`
        : `all_customers.pdf`;
      console.log("Saving PDF with filename:", fileName);
      doc.save(fileName);

      console.log("PDF download complete");
      showToast("PDF downloaded successfully", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Error generating PDF: " + error.message, "error");
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

      <div className="flex items-center gap-4 md:gap-6 md:mb-4 ">
        <div className="md:flex justify-between items-center gap-5 md:gap-7">
          {/* Search Input with Icon */}
          <div className="flex flex-col relative">
            <div className="flex items-center">
              <div className="absolute left-3 text-gray-400">
                <FiSearch size={18} />
              </div>
              <input
                type="search"
                placeholder="Search by name or number..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 p-2 border rounded w-36 sm:w-52 md:w-96"
              />
            </div>
          </div>

          {/* Create Button */}
          <div className="ml-auto text-lg font-semibold flex mt-10 md:ml-52 md:mt-0 sm:mt-10 gap-2">
            <button
              className="bg-green-500 py-2 px-12 md:ml-5 rounded-lg text-white hover:bg-green-600 transition-colors"
              onClick={() => setShowModal(true)}
            >
              Create
            </button>

            <button
              className="bg-blue-500 py-2 px-12 md:ml-5 rounded-lg text-white hover:bg-green-600 transition-colors"
              onClick={downloadCustomersPDF}
            >
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Customer List Section */}
      <div className="mt-8">
        {/* <h2 className="text-xl font-semibold mb-4">Customers</h2> */}

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
                <th className="text-left py-4 px-6 text-gray-500 font-medium">
                  Created At
                </th>
                <th className="text-left py-4 px-6 text-gray-500 font-medium">
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
                  <td className="py-4 px-6 text-gray-700">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => openUpdateModal(customer)}
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => openDeleteModal(customer)}
                      >
                        <FiTrash size={18} />
                      </button>
                    </div>
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

                {expandedRow === customer._id && (
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
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Created At:</div>
                      <div className="text-sm text-gray-900">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="pt-3">
                      <div className="flex justify-between">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                          onClick={() => openUpdateModal(customer)}
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                          onClick={() => openDeleteModal(customer)}
                        >
                          <FiTrash size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Customer Pagination */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="bg-gray-500 mt-5 text-white px-6 py-2 rounded-md hover:bg-gray-600"
          >
            Back
          </Link>

          {/* <div >

          {customers.length > 0 && (
            <div className="mt-4 flex justify-center items-center space-x-2">
              <button
                onClick={() => setCustomersCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={customersCurrentPage === 1}
                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>
              <span>
                Page {customersCurrentPage} of {customersTotalPages}
              </span>
              <button
                onClick={() => setCustomersCurrentPage((prev) => Math.min(prev + 1, customersTotalPages))}
                disabled={customersCurrentPage === customersTotalPages}
                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
            </div> */}
        </div>
      </div>

      {/* Create Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Customer</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                  setCustomerName("");
                  setMobileNumber("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="customerName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label
                  htmlFor="mobileNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mobile Number
                </label>
                <input
                  type="text"
                  id="mobileNumber"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter mobile number"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError("");
                    setCustomerName("");
                    setMobileNumber("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateCustomer}
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                    isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Customer Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Update Customer</h2>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setUpdateError("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            {updateError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {updateError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="updateCustomerName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Customer Name
                </label>
                <input
                  type="text"
                  id="updateCustomerName"
                  value={updateCustomerName}
                  onChange={(e) => setUpdateCustomerName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label
                  htmlFor="updateMobileNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mobile Number
                </label>
                <input
                  type="text"
                  id="updateMobileNumber"
                  value={updateMobileNumber}
                  onChange={(e) => setUpdateMobileNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter mobile number"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowUpdateModal(false);
                    setUpdateError("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateCustomer}
                  disabled={isUpdating}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                    isUpdating ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isUpdating ? "Updating..." : "Update Customer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Delete Customer</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteCustomerId("");
                  setDeleteCustomerName("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteCustomerName}</span>?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteCustomerId("");
                  setDeleteCustomerName("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteCustomer}
                disabled={isDeleting}
                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${
                  isDeleting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;
