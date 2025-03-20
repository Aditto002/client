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
  FiEdit,
  FiTrash,
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
const CreateCustomerModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [dicchi, setDicchi] = useState(true); // Default to "Give" (dicchi: true)
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setMobileNumber("");
      setAmount("");
      setNotes("");
      setDicchi(true);
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!name.trim()) {
      setError("Customer name is required");
      return;
    }

    if (!mobileNumber.trim()) {
      setError("Mobile number is required");
      return;
    }

    // Mobile number validation - only numbers and proper length
    if (!/^\d{10,11}$/.test(mobileNumber.trim())) {
      setError("Please enter a valid 10-11 digit mobile number");
      return;
    }

    if (!amount || isNaN(parseFloat(amount))) {
      setError("Amount must be a valid number");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: name.trim(),
        mobileNumber: mobileNumber.trim(),
        amount: parseFloat(amount),
        notes: notes.trim(),
        dicchi: dicchi
      };

      const response = await axios.post(
        "https://bebsa.ahadalichowdhury.online/api/transactions",
        payload
      );
      console.log("create Data", response.data)
      if (response.data) {
        onSuccess("Transaction created successfully");
        onClose();
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      setError(error.response?.data?.message || "Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-90vh overflow-y-auto animate-fade-in-up">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">Create New Customer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Customer Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter customer name"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                type="text"
                id="mobileNumber"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter mobile number"
              />
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Transaction Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="transactionType"
                    value="give"
                    checked={dicchi === true}
                    onChange={() => setDicchi(true)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Give (দিচ্ছি)</span>
                </label>
                {/* <label className="flex items-center">
                  <input
                    type="radio"
                    name="transactionType"
                    value="take"
                    checked={dicchi === false}
                    onChange={() => setDicchi(false)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Take (Nichi)</span>
                </label> */}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any additional notes"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors font-medium disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// UpdateCustomerModal Component
const UpdateCustomerModal = ({ isOpen, onClose, customer, onSuccess }) => {
  const [name, setName] = useState(customer?.customerName || "");
  const [mobileNumber, setMobileNumber] = useState(customer?.mobileNumber || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Update form when customer changes
  useEffect(() => {
    if (customer) {
      setName(customer.customerName || "");
      setMobileNumber(customer.mobileNumber || "");
    }
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!name.trim()) {
      setError("Customer name is required");
      return;
    }

    if (!mobileNumber.trim()) {
      setError("Mobile number is required");
      return;
    }

    // Mobile number validation - only numbers and proper length
    if (!/^\d{10,11}$/.test(mobileNumber.trim())) {
      setError("Please enter a valid 10-11 digit mobile number");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: name.trim(),
        mobileNumber: mobileNumber.trim()
      };

      const response = await axios.put(
        `https://bebsa.ahadalichowdhury.online/api/transactions/users/${customer._id}`,
        payload
      );
      
      if (response.data) {
        onSuccess("Customer updated successfully");
        onClose();
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      setError(error.response?.data?.message || "Failed to update customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-90vh overflow-y-auto animate-fade-in-up">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">Update Customer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <label htmlFor="update-name" className="block text-sm font-medium text-gray-700">
                Customer Name
              </label>
              <input
                type="text"
                id="update-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter customer name"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label htmlFor="update-mobileNumber" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                type="text"
                id="update-mobileNumber"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter mobile number"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors font-medium disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Updating...
                </div>
              ) : (
                "Update"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
const DeleteConfirmationModal = ({ isOpen, onClose, customer, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError("");

      const response = await axios.delete(
        `https://bebsa.ahadalichowdhury.online/api/transactions/users/${customer._id}`
      );

      if (response.data) {
        onSuccess("Customer deleted successfully");
        onClose();
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      setError(error.response?.data?.message || "Failed to delete customer");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-fade-in-up">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="text-center mb-6">
            <div className="bg-red-100 text-red-500 p-3 rounded-full inline-block mb-4">
              <FiAlertCircle size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Customer</h3>
            <p className="text-gray-600">
              Are you sure you want to delete <span className="font-medium">{customer?.customerName}</span>? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors font-medium disabled:bg-red-300"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
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
  const [totalDueAmount, setTotalDueAmount] = useState(0);
  const [customersCurrentPage, setCustomersCurrentPage] = useState(1);
  const [customersTotalPages, setCustomersTotalPages] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [PDFData, setPDFData] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [totalTake, setTotalTake] = useState(0);
  const [totalGive, setTotalGive] = useState(0);
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
  // Function to fetch customers from the API
  const fetchCustomers = async () => {
    try {
      setIsSearching(true);

      const params = {};

      // Only add search parameter if it has a value
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await axios.get(
        "https://bebsa.ahadalichowdhury.online/api/get-transactions",
        { params }
      );

      // Log the entire response to see its structure
      console.log("Full response:", response.data.totalDueBalance);
      console.log("Response data type:", typeof response.data);
      setTotalDueAmount(response.data)

      if (response.data) {
        // Handle different possible response structures
        if (Array.isArray(response.data)) {
          setCustomers(response.data);
        } else if (response.data.customers && Array.isArray(response.data.customers)) {
          setCustomers(response.data.customers);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setCustomers(response.data.data);
        } else if (typeof response.data === 'object' && response.data !== null) {
          // If response.data is an object but not in expected format,
          // try to extract any array property that might contain the customers
          const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            // Use the first array found
            setCustomers(possibleArrays[0]);
          } else {
            console.error("No arrays found in response data:", response.data);
            setCustomers([]);
            showToast("Could not find customer data in response", "error");
          }
       
        } else {
          console.error("Unexpected response format:", response.data);
          setCustomers([]);
          showToast("Invalid response format", "error");
        }
      } else {
        console.error("No data in response:", response);
        setCustomers([]);
        showToast("No data received from server", "error");
      }
    } catch (error) {
      console.error("Error fetching customers:", error.response || error);

      // More detailed error message
      const errorMessage = error.response?.data?.message || error.message || "Failed to load customers";
      showToast(errorMessage, "error");
      setCustomers([]);
    } finally {
      setIsSearching(false);
    }
  };
  const openUpdateModal = (customer) => {
    setSelectedCustomer(customer);
    setIsUpdateModalOpen(true);
  };

  const openDeleteModal = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCustomersCurrentPage(1); // Reset to first page when search changes
  };
  ////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    const newTotalTake = customers.reduce((total, customer) => {
      // For positive balances (amounts to be received/Pabo)
      if (customer.dueBalance > 0) {
        return total + customer.dueBalance;
      }
      return total;
    }, 0);
    
    setTotalTake(newTotalTake);
  }, [customers]);  
  useEffect(() => {
    const newTotalgive = customers.reduce((total, customer) => {
      // For positive balances (amounts to be received/Pabo)
      if (customer.dueBalance < 0) {
        return total + (customer.dueBalance* -1);
      }
      return total;
    }, 0);
    
    setTotalGive(newTotalgive);
  }, [customers]);  
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
  // const downloadCustomersPDF = async () => {
  //   try {
  //     console.log("Download PDF function called");
  //     setIsDownloading(true);

  //     // Fetch all customers for PDF
  //     const allCustomers = await fetchAllCustomersForPDF();
  //     console.log("Fetched customers for PDF:", allCustomers?.length || 0);

  //     if (!allCustomers || allCustomers.length === 0) {
  //       console.error("No customer data available to download");
  //       showToast("No customer data available to download", "error");
  //       return;
  //     }

  //     // Initialize jsPDF - use portrait orientation
  //     const doc = new jsPDF('p', 'mm', 'a4');
  //     const pageWidth = doc.internal.pageSize.getWidth();

  //     // Add content to PDF (your existing code)
  //     doc.setFontSize(18);
  //     const title = "Deb Telecom";
  //     doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, 22);

  //     // Rest of your PDF generation code...

  //     // Format customer data for the table
  //     const tableData = allCustomers.map((customer, index) => [
  //       index + 1,
  //       customer.customerName || '',
  //       customer.mobileNumber || '',
  //     ]);

  //     // Add the table
  //     autoTable(doc, {
  //       startY: 60,
  //       head: [["S.No", "Customer Name", "Mobile Number"]],
  //       body: tableData,
  //       theme: 'grid',
  //       headStyles: { fillColor: [66, 66, 66] },
  //       alternateRowStyles: { fillColor: [240, 240, 240] },
  //       margin: { top: 48 },
  //     });

  //     // Save the PDF - this line is critical
  //     const fileName = `customers_list_${new Date().toISOString().split('T')[0]}.pdf`;
  //     console.log("Attempting to save PDF with filename:", fileName);

  //     // Try using this more direct approach:
  //     doc.save(fileName);

  //     console.log("PDF download complete");
  //     showToast("Customer list downloaded successfully", "success");
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //     showToast("Error generating PDF: " + error.message, "error");
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };
  const fetchAllCustomersForPDF = async () => {
    try {
      setIsDownloading(true);

      // Use the same endpoint that works for regular fetch
      const response = await axios.get(
        "https://bebsa.ahadalichowdhury.online/api/get-transactions"
      );

      console.log("PDF data response:", response.data);

      // Use the same logic as in fetchCustomers for consistency
      let customersData = [];

      if (response.data) {
        if (Array.isArray(response.data)) {
          customersData = response.data;
        } else if (response.data.customers && Array.isArray(response.data.customers)) {
          customersData = response.data.customers;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          customersData = response.data.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            customersData = possibleArrays[0];
          } else {
            throw new Error("No arrays found in response data");
          }
        } else {
          throw new Error("Unexpected response format");
        }
      } else {
        throw new Error("No data in response");
      }

      return customersData;
    } catch (error) {
      console.error("Error fetching all customers:", error);
      showToast("Failed to fetch customers for PDF", "error");
      throw error;
    }
  };

  // Improved PDF download function
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

      // Add content to PDF
      doc.setFontSize(18);
      const title = "Deb Telecom";
      doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, 22);
      doc.setFontSize(16);
      const titles = "Customer Due";
      doc.text(titles, (pageWidth - doc.getTextWidth(titles)) / 2, 32);

      // Add total due amount if available
      if (totalDueAmount !== undefined) {
        doc.setFontSize(14);
        const totalDueText = `Total Pabo = ${totalTake}`;
        doc.text(totalDueText, (pageWidth - doc.getTextWidth(totalDueText)) / 2, 40);
        doc.setFontSize(14);
        const totalDueTex = `Total dibo = ${totalGive}`;
        doc.text(totalDueTex, (pageWidth - doc.getTextWidth(totalDueTex)) / 2, 48);
      }

      // Current date
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Date: ${currentDate}`, 14, 52);

      // Format customer data for the table
      const tableData = allCustomers.map((customer, index) => [
        index + 1,
        customer.customerName || '',
        customer.mobileNumber || '',
        (customer.dueBalance <0 ? (customer.dueBalance*-1):customer.dueBalance) || '0'  // Added due amount column
      ]);

      // Add the table
      autoTable(doc, {
        startY: 60,
        head: [["S.No", "Customer Name", "Mobile Number", "Due Amount"]],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 48 },
      });

      // Save the PDF
      const fileName = `customers_list_${new Date().toISOString().split('T')[0]}.pdf`;
      console.log("Attempting to save PDF with filename:", fileName);

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
    // Open the modal instead of navigating
    setIsCreateModalOpen(true);
  };



  return (
    <div className="bg-gray-50 min-h-screen bg-slate-200">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
        <CreateCustomerModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(message) => {
            showToast(message);
            fetchCustomers();
          }}
        />
        <UpdateCustomerModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          customer={selectedCustomer}
          onSuccess={(message) => {
            showToast(message);
            fetchCustomers();
          }}
        />
        
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          customer={selectedCustomer}
          onSuccess={(message) => {
            showToast(message);
            fetchCustomers();
          }}
        />

        <div className="md:flex justify-between items-center mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 ">Customers</h1>
            <div className="h-1 w-24 bg-blue-500 mx-auto rounded-full mb-10 md:mb-0"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 ml-7 md:ml-0">
            <button
              onClick={() => navigate('/duehistory')}
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
          <div className="flex md:justify-end mb-4 md:mb-0">
            <button
              onClick={handleCreateCustomer}
              className="bg-green-500 md:ml-10 py-2 px-4 rounded-lg text-white hover:bg-green-600 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              <FiPlus size={16} />
              Create
            </button>
          </div>
          <div className="md:flex items-center justify-between mb-6">
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

            <div className="flex flex-col gap-3 justify-end mt-5">
              {/* <h3 className="bg-red-50 py-1 px-5 rounded ">Total Due : <span className="text-red-500 font-bold ">{totalDueAmount.totalDueBalance}</span> </h3> */}
              <h3 className="bg-red-50 py-1 px-5 rounded ">মোট পাবো : <span className="text-red-500 font-bold ">{totalTake}</span> </h3>
              <h3 className="bg-green-50 py-1 px-5 rounded ">মোট দিবো : <span className="text-green-500 font-bold ">{totalGive}</span> </h3>
            </div>
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
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold shadow-md">
                      Due Amount
                    </th>
                    <th className="text-center py-4 px-6 text-gray-600 font-semibold shadow-md">
                      Due
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
                      {(customer.dueBalance<0)?<td className="py-4 px-6 text-green-600 bg-green-50">
                        <div className="flex items-center gap-2">
                          {/* <FiPhone size={16} className="text-gray-400" /> */}
                          Dibo =  {customer.dueBalance *-1}
                          
                        </div>
                      </td>:<td className="py-4 px-6 text-red-600 bg-red-50">
                        <div className="flex items-center gap-2">
                          {/* <FiPhone size={16} className="text-gray-400" /> */}
                          Pabo =  {customer.dueBalance}
                        </div>
                      </td>}
                      
                      <td className="py-4 px-6 text-center">
                        <button
                          className="bg-blue-500 py-2 px-6 rounded-lg text-white hover:bg-blue-600 transition-colors font-medium shadow-sm hover:shadow-md"
                          onClick={() => handleDueClick(customer.mobileNumber)}
                        >
                          Due
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex gap-2 text-center">
                          <button
                            className=" text-blue-500 hover:text-gray-700"
                            onClick={() => openUpdateModal(customer)}
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            className="text-red-500 hover:text-gray-700"
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
                          <div className="text-sm text-red-500 flex items-center gap-1 mt-1">
                            {/* <FiPhone size={14} /> */}
                            {customer.dueBalance}
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
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-gray-500">
                            Due Amount:
                          </div>
                          <div className="text-sm font-medium text-red-500">
                            {customer.dueBalance}
                          </div>
                        </div>
                        <div className="pt-3 flex justify-center">
                          <button
                            className="bg-blue-500 py-2.5 px-6 rounded-lg text-white hover:bg-blue-600 transition-colors w-full font-medium shadow-sm"
                            onClick={() => handleDueClick(customer.mobileNumber)}
                          >
                            Due
                          </button>
                          <div className="flex">
                            <button
                              className="bg-gray-100 p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors mr-2"
                              onClick={() => openUpdateModal(customer)}
                            >
                              <FiEdit size={20} />
                            </button>
                            <button
                              className="bg-gray-100 p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              onClick={() => openDeleteModal(customer)}
                            >
                              <FiTrash size={20} />
                            </button>
                          </div>
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