import { useState, useEffect } from "react"
import axios from "axios"
import {
  FiUser,
  FiEdit,
  FiTrash,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiDownload
} from "react-icons/fi"
// Import jsPDF correctly
import { jsPDF } from "jspdf"
// Import autoTable plugin with proper syntax
import { autoTable } from 'jspdf-autotable'

const DailyTransaction = () => {
    const getFormattedDate = (date) => {
        return date ? new Date(date).toISOString().split("T")[0] : "";
      };
      const [transactions, setTransactions] = useState([])
      const [PDFData, setPDFData] = useState([])
      const [totalAmount, setTotalAmount] = useState({totalAmount: 0})
      const [expandedRow, setExpandedRow] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState(0)
  const [entryBy, setEntryBy] = useState("")
  const [startDate, setStartDate] = useState("") // Initialize with empty string
  const [endDate, setEndDate] = useState("") // Initialize with empty string
  const [tempSearch, setTempSearch] = useState("")
  const [tempEntryBy, setTempEntryBy] = useState("")
  const [tempStartDate, setTempStartDate] = useState("") // Initialize with empty string
  const [tempEndDate, setTempEndDate] = useState("") // Initialize with empty string

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, search, entryBy, startDate, endDate])

  const fetchTransactions = async () => {
    try {
      console.log("date ", startDate)
      // Prepare params object, only including dates if they have values
      const params = {
        page: currentPage,
        search,
        entryBy,
      }
      
      // Only add date parameters if they're not empty
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await axios.get("http://localhost:5000/api/credit/personal", {
        params: params,
      })
      setTransactions(response.data.data.customers)
      setTotalAmount(response.data.data)
      setTotalPages(response.data.data.pagination.totalPages)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }
  const fetchpdf = async () => {
    try {
      console.log("date ", startDate)
      // Prepare params object, only including dates if they have values
      const params = {
        search,
        entryBy,
      }
      
      // Only add date parameters if they're not empty
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await axios.get("http://localhost:5000/api/credit/download-pdf", {
        params: params,
      })
      setPDFData(response.data.data.customers)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }
  useEffect(() => {
    fetchpdf()
  }, [ search, entryBy, startDate, endDate])

  const handleApplyFilters = () => {
    setSearch(tempSearch)
    setEntryBy(tempEntryBy)
    setStartDate(tempStartDate)
    setEndDate(tempEndDate)
    setCurrentPage(1) // Reset pagination to first page
    fetchTransactions() // Fetch with applied filters
  }

  // Function to download transactions as PDF
  const downloadTransactionsPDF = () => {
    try {
      console.log("Download PDF function called");
      console.log("Transactions data:", transactions);
      
      // Check if transactions exist before proceeding
      if (!transactions || transactions.length === 0) {
        console.error("No transactions data available to download");
        alert("No transactions data available to download");
        return;
      }
      
      // Initialize jsPDF - use portrait orientation
      const doc = new jsPDF('p', 'mm', 'a4');
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

  return (
    <div className="container mx-auto p-4 max-w-6xl">
        <div className="text-center mb-10 mt-10">
  <h1 className="text-4xl font-bold">Daily Transaction</h1>
</div>

<div className="flex flex-wrap items-center justify-between gap-4 md:gap-6">
  <div className="flex flex-wrap items-center gap-5 md:gap-7">
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
        <option value="aditto">Aditto</option>
        <option value="ahad">Ahad</option>
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
  {/* Total Amount - Moved to the right */}
  <div className="ml-auto text-lg font-semibold">
    <p>Total Amount: {totalAmount?.totalAmount}</p>
  </div>
  </div>

</div>


      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
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
            {transactions.map((transaction, index) => (
              <tr
                key={transaction.id}
                className={`border-b border-gray-200 ${index % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <FiUser size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-center">{transaction.customerName}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-700 text-center">{transaction.newAmount}</td>
                <td className="py-4 px-6 text-gray-700 text-center">{transaction.customerNumber}</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 bg-gray-100 text-center text-gray-800 rounded text-sm font-medium">
                    {transaction.selectedAccount}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-700 text-center ">{transaction.selectedNumber}</td>
                <td className="py-4 px-6 text-center">
                  <span className="px-3 py-1 rounded text-sm font-medium ">
                    {transaction.remarks}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {transaction.isYourAccount ? (
                    <button className="px-4 py-2 bg-gray-900 text-white rounded font-medium hover:bg-gray-800 transition-colors">
                      Your Account
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button className="text-gray-500 hover:text-gray-700">
                        <FiEdit size={18} />
                      </button>
                      <button className="text-gray-500 hover:text-gray-700">
                        <FiTrash size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mt-1">
                    <FiUser size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{transaction.customerName}</div>
                    {transaction.newAmount && <div className="text-sm text-gray-500">{transaction.newAmount}</div>}
                    {transaction.customerNumber && <div className="text-sm text-gray-500">{transaction.customerNumber}</div>}
                    {transaction.selectedAccount && <div className="text-sm text-gray-500">{transaction.selectedAccount}</div>}
                  </div>
                </div>
                <button
                  onClick={() => setExpandedRow(expandedRow === transaction.id ? null : transaction.id)}
                  className="text-gray-500"
                >
                  {expandedRow === transaction.id ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                </button>
              </div>

              {expandedRow === transaction.id && (
                <div className="mt-4 space-y-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Customer Name:</div>
                    <div className="text-sm text-gray-900">{transaction.customerName}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Amount:</div>
                    <div className="text-sm text-gray-900">{transaction.newAmount}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Customer Number:</div>
                    <div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">
                        {transaction.customerNumber}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Own Number:</div>
                    <div className="text-sm text-gray-900">{transaction.selectedAccount}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Balance:</div>
                    <div>
                      <span className="px-3 py-1 rounded text-sm font-medium">
                        {transaction.selectedNumber}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Remarks:</div>
                    <div>
                      <span className="px-3 py-1 rounded text-sm font-medium">
                        {transaction.remarks}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3">
                      <div className="flex justify-between">
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                          <FiEdit size={18} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
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
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  )
}

export default DailyTransaction