import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiDownload,
  FiX,
} from "react-icons/fi";
// Import jsPDF correctly
import { jsPDF } from "jspdf";
// Import autoTable plugin with proper syntax
import { autoTable } from "jspdf-autotable";
import { Link } from "react-router-dom";

const StatementPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [PDFData, setPDFData] = useState([]);
  const [totalAmount, setTotalAmount] = useState({ totalAmount: 0 });
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [selectCompany, setSelectCompany] = useState("");
  const [selectedNumber, setSelectedNumber] = useState("");

  // Add state for update modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    _id: "",
    selectCompany: "",
    totalAmount: "",
    mobileNumber: "",
  });

  // Add state for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    // Extract parameters from URL on component mount
    const queryParams = new URLSearchParams(window.location.search);
    const companyFromUrl = queryParams.get("selectCompany");
    const numberFromUrl = queryParams.get("selectedNumber");
    const startDateFromUrl = queryParams.get("startDate");
    const endDateFromUrl = queryParams.get("endDate");

    // Set state with URL parameters
    if (companyFromUrl) setSelectCompany(companyFromUrl);
    if (numberFromUrl) setSelectedNumber(numberFromUrl);
    if (startDateFromUrl) {
      setStartDate(startDateFromUrl);
      setTempStartDate("");
    }
    if (endDateFromUrl) {
      setEndDate(endDateFromUrl);
      setTempEndDate("");
    }
  }, []);

  useEffect(() => {
    // Only fetch when we have the necessary data from URL
    if (selectCompany || selectedNumber || startDate || endDate) {
      fetchTransactions();
    }
  }, [currentPage, startDate, endDate, selectCompany, selectedNumber]);

  const fetchTransactions = async () => {
    try {
      // Prepare params object, only including parameters if they have values
      const params = {
        page: currentPage,
      };

      // Only add parameters if they're not empty
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectCompany) params.selectCompany = selectCompany;
      if (selectedNumber) params.selectedNumber = selectedNumber;

      // Use the new API endpoint for account data
      const response = await axios.get(
        "https://bebsa.ahadalichowdhury.online/api/credit/account-datas",
        {
          params: params,
        }
      );

      // Set transactions from the response
      setTransactions(response.data.data);

      // Set pagination information
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
      }

      // Calculate total amount
      const sum = response.data.data.reduce(
        (acc, transaction) => acc + (transaction.newAmount || 0),
        0
      );
      setTotalAmount({ totalSum: sum });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchpdf = async () => {
    try {
      // Prepare params object, only including parameters if they have values
      const params = {};

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectCompany) params.selectCompany = selectCompany;
      if (selectedNumber) params.selectedNumber = selectedNumber;

      // Use the same endpoint for PDF data for now
      const response = await axios.get(
        "https://bebsa.ahadalichowdhury.online/api/credit/account-datas",
        {
          params: params,
        }
      );

      setPDFData(response.data.data);
    } catch (error) {
      console.error("Error fetching PDF data:", error);
    }
  };

  useEffect(() => {
    if (selectCompany || selectedNumber || startDate || endDate) {
      fetchpdf();
    }
  }, [startDate, endDate, selectCompany, selectedNumber]);

  const handleApplyFilters = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1); // Reset pagination to first page
    fetchTransactions(); // Fetch with applied filters
  };

  // Function to open update modal with pre-populated data
  const handleUpdateClick = (transaction) => {
    // Check if transaction has _id property, if not use id
    const transactionId = transaction._id || transaction.id;

    if (!transactionId) {
      console.error("Transaction ID is missing", transaction);
      alert("Error: Transaction ID is missing");
      return;
    }

    setUpdateData({
      _id: transactionId, // Use the correct ID property name
      selectCompany: transaction.company,
      totalAmount: transaction.newAmount,
      mobileNumber: transaction.selectedNumber,
    });
    setShowUpdateModal(true);
  };

  // Function to handle input changes in update modal
  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to submit update
  const handleUpdateSubmit = async () => {
    try {
      if (!updateData._id) {
        console.error("Update ID is missing", updateData);
        alert("Error: Update ID is missing");
        return;
      }

      await axios.put(
        `https://bebsa.ahadalichowdhury.online/api/credit/${updateData._id}`,
        updateData
      );
      setShowUpdateModal(false);
      fetchTransactions(); // Refresh the data
      alert("Record updated successfully");
    } catch (error) {
      console.error("Error updating record:", error);
      alert("Error updating record: " + error.message);
    }
  };

  // Function to open delete confirmation
  const handleDeleteClick = (id) => {
    // Check if we got a valid ID
    if (!id) {
      console.error("Invalid ID for deletion", id);
      alert("Error: Invalid ID for deletion");
      return;
    }

    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Function to confirm and execute delete
  const confirmDelete = async () => {
    try {
      if (!deleteId) {
        console.error("Delete ID is missing");
        alert("Error: Delete ID is missing");
        return;
      }

      await axios.delete(
        `https://bebsa.ahadalichowdhury.online/api/credit/${deleteId}`
      );
      setShowDeleteConfirm(false);
      fetchTransactions(); // Refresh the data
      alert("Record deleted successfully");
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Error deleting record: " + error.message);
    }
  };

  const downloadTransactionsPDF = async () => {
    try {
      console.log("Download PDF function called");

      // First, make sure we have the full dataset for the PDF
      await fetchpdf();

      // Use PDFData instead of transactions
      if (!PDFData || PDFData.length === 0) {
        console.error("No transactions data available to download");
        alert("No transactions data available to download");
        return;
      }

      // Initialize jsPDF - use portrait orientation
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth(); // Get page width

      doc.setFontSize(18);

      // Center "Deb Telecom"
      const title = "Deb Telecom";
      doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, 22);

      // Center "Moulvibazar Road, Afrozganj Bazar Sherpur"
      const address = "Moulvibazar Road, Afrozganj Bazar Sherpur";
      doc.text(address, (pageWidth - doc.getTextWidth(address)) / 2, 30);

      // Center "Daily Transaction Register"
      const subtitle = "Daily Transaction Register";
      doc.text(subtitle, (pageWidth - doc.getTextWidth(subtitle)) / 2, 38);

      // Add report metadata
      doc.setFontSize(11);

      const dateRangeText =
        startDate && endDate
          ? `Date Range: ${startDate} to ${endDate}`
          : "Date Range: All dates";
      doc.text(
        dateRangeText,
        (pageWidth - doc.getTextWidth(dateRangeText)) / 2,
        48
      );

      const accountText = `Account: ${selectCompany || "All"} - ${
        selectedNumber || "All"
      }`;
      doc.text(
        accountText,
        (pageWidth - doc.getTextWidth(accountText)) / 2,
        54
      );

      const totalAmountText = `Total Amount: ${totalAmount?.totalSum || 0}`;
      doc.text(
        totalAmountText,
        (pageWidth - doc.getTextWidth(totalAmountText)) / 2,
        60
      );

      const generatedText = `Generated on: ${new Date().toLocaleString()}`;
      doc.text(
        generatedText,
        (pageWidth - doc.getTextWidth(generatedText)) / 2,
        66
      );

      // Format transaction data for the table - use PDFData instead of transactions
      const tableData = PDFData.map((transaction) => [
        transaction.customerName || "",
        transaction.customerNumber || "",
        transaction.company || "",
        transaction.selectedAccount || "",
        transaction.newAmount || "",
        transaction.remarks || "",
        transaction.statement || "",
        new Date(transaction.createdAt).toLocaleDateString(),
      ]);

      // Define table columns
      const headers = [
        "Customer",
        "Number",
        "Company",
        "Account",
        "Amount",
        "Remarks",
        "Statement",
        "Date",
      ];

      // Add transactions table with auto table and capture the final Y position
      let finalY;
      autoTable(doc, {
        startY: 76,
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

      // Add total amount text below the line
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");

      // Save the PDF
      const fileName =
        startDate && endDate
          ? `transactions_${startDate}_to_${endDate}.pdf`
          : `transactions_all_dates.pdf`;
      console.log("Saving PDF with filename:", fileName);
      doc.save(fileName);

      console.log("PDF download complete");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF: " + error.message);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="text-center mb-10 mt-10">
        <h1 className="text-4xl font-bold">Statement</h1>
        {selectCompany && (
          <p className="text-xl mt-2">
            {selectCompany} - {selectedNumber}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 md:gap-6 md:mb-8">
        <div className="flex flex-wrap justify-between items-center gap-5 md:gap-7">
          {/* Date Pickers */}
          <div className="flex flex-col">
            <label className="block text-sm font-light mb-1">From</label>
            <input
              type="date"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              className="p-2 border rounded w-40 sm:w-52 md:w-60"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-light mb-1">To</label>
            <input
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              className="p-2 border rounded w-40 sm:w-52 md:w-60"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 md:mt-5">
            <button
              onClick={handleApplyFilters}
              className="bg-green-500 text-white py-2 px-5 rounded-lg"
            >
              Apply
            </button>

            <button
              onClick={downloadTransactionsPDF}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <FiDownload size={14} /> Download PDF
            </button>
          </div>
          {/* Total Amount - Moved to the right */}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 text-gray-500 font-medium">
                Customer
              </th>
              <th className="text-left py-4 px-4 text-gray-500 font-medium">
                Number
              </th>
              <th className="text-left py-4 px-4 text-gray-500 font-medium">
                Company
              </th>
              <th className="text-left py-4 px-4 text-gray-500 font-medium">
                Account
              </th>
              <th className="text-right py-4 px-4 text-gray-500 font-medium">
                Amount
              </th>
              <th className="text-left py-4 px-4 text-gray-500 font-medium">
                Remarks
              </th>
              {/* <th className="text-left py-4 px-4 text-gray-500 font-medium">
                Statement
              </th> */}
              <th className="text-left py-4 px-4 text-gray-500 font-medium">
                Date
              </th>
              {/* <th className="text-left py-4 px-4 text-gray-500 font-medium">
                Action
              </th> */}
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr
                key={transaction._id || transaction.id}
                className={`border-b border-gray-200 ${
                  index % 2 === 1 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="py-4 px-4 text-gray-700">
                  {transaction.customerName}
                </td>
                <td className="py-4 px-4 text-gray-700">
                  {transaction.customerNumber}
                </td>
                <td className="py-4 px-4 text-gray-700">
                  {transaction.company}
                </td>
                <td className="py-4 px-4 text-gray-700">
                  {transaction.selectedAccount}
                </td>
                <td className="py-4 px-4 text-gray-700 text-right">
                  {transaction.newAmount}
                </td>
                <td className="py-4 px-4 text-gray-700">
                  {transaction.remarks}
                </td>
                {/* <td className="py-4 px-4 text-gray-700">
                  {transaction.statement}
                </td> */}
                <td className="py-4 px-4 text-gray-700">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </td>
                {/* <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleUpdateClick(transaction)}
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() =>
                        handleDeleteClick(transaction._id || transaction.id)
                      }
                    >
                      <FiTrash size={18} />
                    </button>
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction._id || transaction.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {transaction.customerName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.customerNumber}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {transaction.newAmount}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() =>
                    setExpandedRow(
                      expandedRow === (transaction._id || transaction.id)
                        ? null
                        : transaction._id || transaction.id
                    )
                  }
                  className="text-gray-500"
                >
                  {expandedRow === (transaction._id || transaction.id) ? (
                    <FiChevronUp size={20} />
                  ) : (
                    <FiChevronDown size={20} />
                  )}
                </button>
              </div>

              {expandedRow === (transaction._id || transaction.id) && (
                <div className="mt-4 space-y-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Company:</div>
                    <div className="text-sm text-gray-900">
                      {transaction.company}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Account:</div>
                    <div className="text-sm text-gray-900">
                      {transaction.selectedAccount}
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
                  <div className="pt-3">
                    {/* <div className="flex justify-between">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-full text-blue-500"
                        onClick={() => handleUpdateClick(transaction)}
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-full text-red-500"
                        onClick={() =>
                          handleDeleteClick(transaction._id || transaction.id)
                        }
                      >
                        <FiTrash size={18} />
                      </button>
                    </div> */}
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

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Update Record</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="selectCompany"
                  value={updateData.selectCompany}
                  onChange={handleUpdateInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="text"
                  name="totalAmount"
                  value={updateData.totalAmount}
                  onChange={handleUpdateInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={updateData.mobileNumber}
                  onChange={handleUpdateInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="p-5 border-t flex justify-end space-x-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-3">Confirm Delete</h3>
              <p className="text-gray-700">
                Are you sure you want to delete this record? This action cannot
                be undone.
              </p>
            </div>
            <div className="p-5 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatementPage;
