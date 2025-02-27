import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUser,
  FiEdit,
  FiTrash,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiX
} from "react-icons/fi";
// Import jsPDF correctly
import { jsPDF } from "jspdf";
// Import autoTable plugin
import autoTable from 'jspdf-autotable';

const DailyTransaction = () => {
  const getFormattedDate = (date) => {
    return date ? new Date(date).toISOString().split("T")[0] : "";
  };
  
  const [transactions, setTransactions] = useState([]);
  const [PDFData, setPDFData] = useState([]);
  const [totalAmount, setTotalAmount] = useState({totalAmount: 0});
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");  // Changed from 0 to empty string for search
  const [entryBy, setEntryBy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [tempEntryBy, setTempEntryBy] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  
  // States for update modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    _id: "",
    customerName: "",
    company: "",
    selectedAccount: "",
    selectedNumber: "",
    newAmount: 0,
    remarks: "",
    statement: "",
    entryBy: ""
  });
  
  // States for delete confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, search, entryBy, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      // Prepare params object, only including dates if they have values
      const params = {
        page: currentPage,
        search,
        entryBy,
      };
      
      // Only add date parameters if they're not empty
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get("http://localhost:5000/api/credit/personal", {
        params: params,
      });
      
      // Check if response data has expected structure
      if (response.data && response.data.data) {
        setTransactions(response.data.data.customers || []);
        setTotalAmount(response.data.data);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      } else {
        console.error("Unexpected response format:", response.data);
        setTransactions([]);
        setTotalAmount({totalAmount: 0});
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
      setTotalAmount({totalAmount: 0});
      setTotalPages(1);
    }
  };
  
  const fetchPDF = async () => {
    try {
      // Prepare params object, only including dates if they have values
      const params = {
        search,
        entryBy,
      };
      
      // Only add date parameters if they're not empty
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get("http://localhost:5000/api/credit/download-pdf", {
        params: params,
      });
      
      if (response.data && response.data.data && response.data.data.customers) {
        setPDFData(response.data.data.customers);
      } else {
        console.error("Unexpected PDF data format:", response.data);
        setPDFData([]);
      }
    } catch (error) {
      console.error("Error fetching PDF data:", error);
      setPDFData([]);
    }
  };
  
  useEffect(() => {
    fetchPDF();
  }, [search, entryBy, startDate, endDate]);

  const handleApplyFilters = () => {
    setSearch(tempSearch);
    setEntryBy(tempEntryBy);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1); // Reset pagination to first page
  };

  // Function to download transactions as PDF
  const downloadTransactionsPDF = () => {
    try {
      console.log("Download PDF function called");
      
      // Check if transactions exist before proceeding
      if (!transactions || transactions.length === 0) {
        console.error("No transactions data available to download");
        alert("No transactions data available to download");
        return;
      }
      
      // Initialize jsPDF - use portrait orientation
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
  
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
  
      const dateRangeText = startDate && endDate 
        ? `Date Range: ${startDate} to ${endDate}`
        : "Date Range: All dates";
      doc.text(dateRangeText, (pageWidth - doc.getTextWidth(dateRangeText)) / 2, 48);
  
      const totalAmountText = `Total Amount: ${totalAmount?.totalAmount || 0}`;
      doc.text(totalAmountText, (pageWidth - doc.getTextWidth(totalAmountText)) / 2, 54);
  
      const generatedText = `Generated on: ${new Date().toLocaleString()}`;
      doc.text(generatedText, (pageWidth - doc.getTextWidth(generatedText)) / 2, 60);
      
      // Format transaction data for the table
      const tableData = transactions.map(transaction => [
        transaction.customerName || '',
        transaction.newAmount || '',
        transaction.customerNumber || '',
        transaction.selectedAccount || '',
        transaction.selectedNumber || '',
        transaction.remarks || ''
      ]);
      
      // Define table columns
      const headers = [
        "Customer Name", 
        "Amount", 
        "Customer Number", 
        "Own Number", 
        "Balance", 
        "Remarks"
      ];
      
      // Add transactions table with auto table and capture the final Y position
      let finalY;
      autoTable(doc, {
        startY: 70,
        head: [headers],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 48 },
        didDrawPage: (data) => {
          finalY = data.cursor.y; // This captures the Y position after the table is drawn
        }
      });
      
      // Add horizontal line after the table
      doc.setDrawColor(0); // Black color
      doc.setLineWidth(0.5); // Line width
      doc.line(10, finalY + 10, pageWidth - 10, finalY + 10); // Draw line
      
      // Add total amount text below the line
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const grandTotalText = `Grand Total: ${totalAmount?.totalAmount || 0}`;
      doc.text(grandTotalText, pageWidth - 20 - doc.getTextWidth(grandTotalText), finalY + 20); // Right-aligned
      
      // Save the PDF
      const fileName = startDate && endDate 
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

  // Open update modal with transaction data
  const handleOpenUpdateModal = (transaction) => {
    setUpdateData({
      _id: transaction._id || "",
      customerName: transaction.customerName || "",
      customerNumber: transaction.customerNumber || "", // Add this missing field
      company: transaction.company || "",
      selectedAccount: transaction.selectedAccount || "",
      selectedNumber: transaction.selectedNumber || "",
      newAmount: transaction.newAmount || 0,
      remarks: transaction.remarks || "",
      statement: transaction.statement || "",
      entryBy: transaction.entryBy || ""
    });
    setIsUpdateModalOpen(true);
  };

  // Handle update form input changes
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: name === "newAmount" ? parseFloat(value) || 0 : value
    }));
  };

  // Submit update to API
  const handleUpdateSubmit = async () => {
    try {
      // Log the ID before making the API call
      console.log("Updating transaction with ID:", updateData._id);
      
      // Make sure we're using the correct ID in the URL
      if (!updateData._id) {
        throw new Error("Transaction ID is missing");
      }
      
      // Use the _id in the API endpoint
      await axios.put(`http://localhost:5000/api/credit/${updateData._id}`, updateData);
      setIsUpdateModalOpen(false);
      fetchTransactions(); // Refresh data after update
      alert("Transaction updated successfully");
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Error updating transaction: " + error.message);
    }
  };

  // Open delete confirmation
  const handleOpenDeleteConfirm = (id) => {
    // Make sure we're capturing the correct ID
    if (!id) {
      console.error("Cannot delete: Transaction ID is undefined");
      alert("Cannot delete: Transaction ID is missing");
      return;
    }
    setDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  // Submit delete to API
  const handleDeleteConfirm = async () => {
    try {
      // Log the ID before making the API call
      console.log("Deleting transaction with ID:", deleteId);
      
      // Make sure we have a valid ID
      if (!deleteId) {
        throw new Error("Transaction ID is missing");
      }
      
      await axios.delete(`http://localhost:5000/api/credit/${deleteId}`);
      setIsDeleteConfirmOpen(false);
      fetchTransactions(); // Refresh data after delete
      alert("Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Error deleting transaction: " + error.message);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="text-center mb-10 mt-10">
        <h1 className="text-4xl font-bold">Daily Transaction</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 md:gap-6">
        <div className="flex flex-wrap items-center justify-center gap-5 md:gap-7">
          {/* Search Input */}
          <div className="flex flex-col">
            <label className="block text-sm font-light mb-1">Search By Number</label>
            <input
              type="text"
              placeholder="Search By Number..."
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              className="p-2 border rounded w-40 sm:w-52 md:w-60"
            />
          </div>

          {/* Entry By */}
          <div className="flex flex-col">
            <label className="block text-sm font-light mb-1">Entry By</label>
            <select
              className="border rounded-md p-2 bg-white w-40 sm:w-52 md:w-60"
              value={tempEntryBy}
              onChange={(e) => setTempEntryBy(e.target.value)}
            >
              <option value="">Entry By</option>
              <option value="Rajib">Rajib</option>
              <option value="Rony">Rony</option>
            </select>
          </div>

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
          <div className="flex items-center md:ml-96 gap-4">
            <button onClick={handleApplyFilters} className="bg-green-500 text-white py-2 px-5 rounded-lg">
              Apply
            </button>

            <button 
              onClick={downloadTransactionsPDF} 
              className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <FiDownload size={14} /> Download PDF
            </button>
          </div>
        <div className="ml-auto text-lg font-semibold">
          <p>Total Amount: {totalAmount?.totalAmount || 0}</p>
        </div>
        </div>
        {/* Total Amount */}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto mt-6">
        <table className="w-full whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-center">Customer Name</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-center">Amount</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-center">Customer Number</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-center">Own Number</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-center">Balance</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-center">Remarks</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <tr
                  key={transaction._id || index}
                  className={`border-b border-gray-200 ${index % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <FiUser size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-center">{transaction.customerName || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-700 text-center">{transaction.newAmount || 0}</td>
                  <td className="py-4 px-6 text-gray-700 text-center">{transaction.customerNumber || 'N/A'}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-gray-100 text-center text-gray-800 rounded text-sm font-medium">
                      {transaction.selectedAccount || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-700 text-center">{transaction.selectedNumber || 'N/A'}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="px-3 py-1 rounded text-sm font-medium">
                      {transaction.remarks || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {transaction.isYourAccount ? (
                      <button className="px-4 py-2 bg-gray-900 text-white rounded font-medium hover:bg-gray-800 transition-colors">
                        Your Account
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => handleOpenUpdateModal(transaction)}
                        >
                          <FiEdit size={18} />
                        </button>
                        <button 
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => handleOpenDeleteConfirm(transaction._id)}
                        >
                          <FiTrash size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-6 text-center text-gray-500">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4 mt-6">
        {transactions && transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <div key={transaction._id || index} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mt-1">
                      <FiUser size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{transaction.customerName || 'N/A'}</div>
                      {transaction.newAmount && <div className="text-sm text-gray-500">{transaction.newAmount}</div>}
                      {transaction.customerNumber && <div className="text-sm text-gray-500">{transaction.customerNumber}</div>}
                      {transaction.selectedAccount && <div className="text-sm text-gray-500">{transaction.selectedAccount}</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedRow(expandedRow === transaction._id ? null : transaction._id)}
                    className="text-gray-500"
                  >
                    {expandedRow === transaction._id ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                  </button>
                </div>

                {expandedRow === transaction._id && (
                  <div className="mt-4 space-y-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Customer Name:</div>
                      <div className="text-sm text-gray-900">{transaction.customerName || 'N/A'}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Amount:</div>
                      <div className="text-sm text-gray-900">{transaction.newAmount || 0}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Customer Number:</div>
                      <div>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">
                          {transaction.customerNumber || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Own Number:</div>
                      <div className="text-sm text-gray-900">{transaction.selectedAccount || 'N/A'}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Balance:</div>
                      <div>
                        <span className="px-3 py-1 rounded text-sm font-medium">
                          {transaction.selectedNumber || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Remarks:</div>
                      <div>
                        <span className="px-3 py-1 rounded text-sm font-medium">
                          {transaction.remarks || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3">
                      <div className="flex justify-between">
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                          onClick={() => handleOpenUpdateModal(transaction)}
                        >
                          <FiEdit size={18} />
                        </button>
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                          onClick={() => handleOpenDeleteConfirm(transaction._id)}
                        >
                          <FiTrash size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">No transactions found</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <FiChevronRight />
          </button>
        </div>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold">Update Transaction</h2>
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={updateData.customerName}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  value={updateData.company}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Own Number</label>
                <input
                  type="text"
                  name="selectedAccount"
                  value={updateData.selectedAccount}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Balance</label>
                <input
                  type="text"
                  name="selectedNumber"
                  value={updateData.selectedNumber}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  name="newAmount"
                  value={updateData.newAmount}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Remarks</label>
                <textarea
                  name="remarks"
                  value={updateData.remarks}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Statement</label>
                <textarea
                  name="statement"
                  value={updateData.statement}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                  rows="2"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Entry By</label>
                <select
                  name="entryBy"
                  value={updateData.entryBy}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="Rajib">Rajib</option>
                  <option value="Rony">Rony</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this transaction? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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

export default DailyTransaction;