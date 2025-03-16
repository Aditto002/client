import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function SingleDuePage() {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGiveModal, setShowGiveModal] = useState(false);
  const [showTakeModal, setShowTakeModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [transactionSuccess, setTransactionSuccess] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const summaryTextRef = useRef(null);

  // Extract mobile number from URL query parameter
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mobileNumber = queryParams.get("mobileNumber");

  const fetchCustomerData = async () => {
    if (!mobileNumber) {
      setError("Mobile number not provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `https://bebsa.ahadalichowdhury.online/api/transactions/${mobileNumber}`
      );
      console.log("data",response.data)
      setCustomerData(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch customer data");
      setLoading(false);
      console.error("Error fetching customer data:", err);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [mobileNumber]);

  // Format the date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleGiveSubmit = async (e) => {
    e.preventDefault();
    setTransactionLoading(true);
    setTransactionError(null);
    setTransactionSuccess(null);

    try {
      await axios.post(
        `https://bebsa.ahadalichowdhury.online/api/transactions/give/${mobileNumber}`,
        {
          amount: Number(amount),
          notes: notes,
        }
      );
      setTransactionSuccess("Amount added successfully!");
      setAmount("");
      setNotes("");
      setShowGiveModal(false);
      // Refresh data after transaction
      fetchCustomerData();
    } catch (err) {
      setTransactionError("Failed to add amount. Please try again.");
      console.error("Error adding amount:", err);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleTakeSubmit = async (e) => {
    e.preventDefault();
    setTransactionLoading(true);
    setTransactionError(null);
    setTransactionSuccess(null);

    try {
      await axios.post(
        `https://bebsa.ahadalichowdhury.online/api/transactions/take/${mobileNumber}`,
        {
          amount: Number(amount),
          notes: notes,
        }
      );
      setTransactionSuccess("Amount taken successfully!");
      setAmount("");
      setNotes("");
      setShowTakeModal(false);
      // Refresh data after transaction
      fetchCustomerData();
    } catch (err) {
      setTransactionError("Failed to take amount. Please try again.");
      console.error("Error taking amount:", err);
    } finally {
      setTransactionLoading(false);
    }
  };

  // Function to generate summary text for copying
  const generateSummaryText = () => {
    if (!customerData) return "";

    // Ensure transactions are sorted by date in descending order (latest first)
    const latestTransaction = customerData.transactions.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0];
    // console.log(latestTransaction);

    let summary = `প্রিয়, ${customerData.customerName}\n`;
    summary += `আজকে কেনা: ৳ ${latestTransaction?.given || 0}\n`;
    summary += `মোট বাকি:  ৳ ${customerData.dueBalance}\n\n`;

    summary += `দেব টেলিকম,\n`;
    summary += `শেরপুর, মৌলভীবাজার।\n`;
    summary += `MOBILE-01733-402030`;

    return summary;
  };

  // Function to handle copy to clipboard
  const handleCopyToClipboard = () => {
    if (summaryTextRef.current) {
      navigator.clipboard
        .writeText(summaryTextRef.current.value)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  };

  const downloadTransactionData = () => {
    if (!customerData) return;

    try {
      console.log("Download PDF function called");

      // Initialize jsPDF - use portrait orientation
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(18);

      // Center "Deb Telecom"
      const title = "Deb Telecom";
      doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, 22);

      // Center "Moulvibazar Road, Afrozganj Bazar Sherpur"
      const address = "Moulvibazar Road, Afrozganj Bazar Sherpur";
      doc.setFontSize(12);
      doc.text(address, (pageWidth - doc.getTextWidth(address)) / 2, 30);

      // Center "Customer Transaction Register"
      const subtitle = "Due History";
      doc.setFontSize(14);
      doc.text(subtitle, (pageWidth - doc.getTextWidth(subtitle)) / 2, 38);

      // Add report metadata
      doc.setFontSize(11);

      const customerNameText = `Customer: ${customerData.customerName}`;
      doc.text(customerNameText, 15, 48);

      const mobileNumberText = `Mobile: ${customerData.mobileNumber}`;
      doc.text(mobileNumberText, 15, 54);

      const dueBalanceText = `Due Balance: ${customerData.dueBalance}`;
      doc.text(dueBalanceText, 15, 60);

      const generatedText = `Generated on: ${new Date().toLocaleString()}`;
      doc.text(
        generatedText,
        pageWidth - 15 - doc.getTextWidth(generatedText),
        48
      );

      // Format transaction data for the table
      const tableData = customerData.transactions.map((transaction) => [
        formatDate(transaction.date),
        transaction.taken ? `${transaction.taken}` : "-",
        transaction.given ? `${transaction.given}` : "-",
        `${transaction.balance}`,
        transaction.notes || "-",
      ]);

      // Add total row
      tableData.push([
        "Total",
        `${customerData.totalTaken}`,
        `${customerData.totalGiven}`,
        `${customerData.dueBalance}`,
        "",
      ]);

      // Define table columns
      const headers = ["Date", "Taken", "Given", "Balance", "Notes"];

      // Add transactions table with auto table and capture the final Y position
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

      // Add signature lines
      doc.setFontSize(10);
      doc.text("Customer Signature", 20, finalY + 25);
      doc.text(
        "Authorized Signature",
        pageWidth - 20 - doc.getTextWidth("Authorized Signature"),
        finalY + 25
      );

      // Draw signature lines
      doc.line(20, finalY + 28, 70, finalY + 28);
      doc.line(pageWidth - 70, finalY + 28, pageWidth - 20, finalY + 28);

      // Save the PDF
      const fileName = `${customerData.customerName}_transactions.pdf`;
      console.log("Saving PDF with filename:", fileName);
      doc.save(fileName);

      console.log("PDF download complete");
      // You can add toast notification here if you have toast library
      // toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      // toast.error("Error generating PDF: " + error.message);
    }
  };

  // Skeleton loading UI
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-300 p-4 rounded-t-lg flex justify-between items-center">
          <h1 className="text-xl font-bold">Due History</h1>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-lg font-normal font-sans">
                  তারিখ
                </th>
                <th className="text-right p-2 text-lg font-normal font-sans text-green-600 ">
                  নিয়েছি
                </th>
                <th className="text-right p-2 text-lg font-normal font-sans">
                  দিয়েছি
                </th>
                <th className="text-right p-2 text-lg font-normal font-sans">
                  ব্যালেন্স
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(4)].map((_, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">
                    <div className="h-4 py-2 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </td>
                  <td className="text-right p-2 py-2">
                    <div className="h-4 bg-gray-200 rounded w-16 ml-auto animate-pulse"></div>
                  </td>
                  <td className="text-right p-2 py-2">
                    <div className="h-4 bg-gray-200 rounded w-16 ml-auto animate-pulse"></div>
                  </td>
                  <td className="text-right p-2 py-2">
                    <div className="h-4 bg-gray-200 rounded w-16 ml-auto animate-pulse"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="h-14 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-14 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !customerData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-600">
            {error || "No customer data available"}
          </p>
        </div>
        <div className="flex justify-center mt-6">
          <Link
            to="/"
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {transactionSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
          <p>{transactionSuccess}</p>
        </div>
      )}

      {transactionError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{transactionError}</p>
        </div>
      )}

      <div className="bg-yellow-300 p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-bold">Due History</h1>
        <button
          onClick={downloadTransactionData}
          className="p-2 rounded-full hover:bg-yellow-400 transition-colors"
          title="Download transaction data"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold">
              {customerData.customerName} (Customer)
            </div>
            <div>{customerData.mobileNumber}</div>
            <div className="text-red-500">
              পাবো: ৳ {customerData.dueBalance}
            </div>
          </div>
          {/* <div className="flex gap-2">
            <a
              href={`tel:${customerData.mobileNumber}`}
              className="p-2 rounded-full bg-gray-200"
            >
              <span className="sr-only">Call</span>📞
            </a>
            <a
              href={`sms:${customerData.mobileNumber}`}
              className="p-2 rounded-full bg-gray-200"
            >
              <span className="sr-only">Message</span>💬
            </a>
          </div> */}
        </div>
      </div>

      {/* View Button */}
      <div className="mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={() => setShowViewModal(true)}
        >
          কাস্টমারকে বাকির ম্যাসেজ পাঠান
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="inline-block w-4 h-4 ml-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 19l7-7-7-7M5 12h14"
            />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 text-lg font-normal font-sans ">
                তারিখ
              </th>
              <th className=" p-2 text-lg font-normal font-sans text-green-600 text-right">
                নিয়েছি
              </th>
              <th className="text-right p-2 text-lg font-normal font-sans text-red-600">
                দিয়েছি
              </th>
              <th className="text-right p-2 text-lg font-normal font-sans">
                ব্যালেন্স
              </th>
            </tr>
          </thead>
          <tbody>
            {customerData.transactions.map((transaction) => (
              <>
              <tr key={transaction._id} className="border-b shadow-md ">
              <td className="p-2 py-3">
                      {`${formatDate(transaction.date)}`}
                       <br />
                       {transaction.notes ? `নোট: ${transaction.notes}` : ''}
                        </td>
                {/* <p>{transaction.given}</p> */}
                <td className=" p-2 py-3 text-emerald-700 bg-green-100 text-right">
                  {transaction.taken > 0 ? `৳ ${transaction.taken}` : "-"}
                </td>
                <td className="text-right p-2 py-3 text-red-600 bg-red-100">
                  {transaction.given > 0 ? `৳ ${transaction.given}` : "-"}
                </td>
                <td className="text-right py-5 p-3">৳ {transaction.balance}</td>
              </tr>
               <tr className="h-3"></tr>
               </>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td className="p-2">মোট</td>
              <td className="text-right p-2 text-emerald-600">
                ৳ {customerData.totalTaken}
              </td>
              <td className="text-right p-2 text-red-600">
                ৳ {customerData.totalGiven}
              </td>
              <td className="text-right p-2">৳ {customerData.dueBalance}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          className="bg-red-500 text-white p-4 rounded-lg text-center font-bold"
          onClick={() => setShowGiveModal(true)}
        >
          দিচ্ছি
        </button>
        <button
          className="bg-emerald-500 text-white p-4 rounded-lg text-center font-bold"
          onClick={() => setShowTakeModal(true)}
        >
          নিচ্ছি
        </button>
      </div>
      <div className="flex justify-center mt-6">
        <Link
          to="/"
          className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
        >
          Back to Home
        </Link>
      </div>

      {/* Give Modal */}
      {showGiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Give Amount</h2>
            <form onSubmit={handleGiveSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  placeholder="Add notes (optional)"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGiveModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transactionLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  {transactionLoading ? "Processing..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Take Modal */}
      {showTakeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Take Amount</h2>
            <form onSubmit={handleTakeSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  placeholder="Add notes (optional)"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTakeModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transactionLoading}
                  className="px-4 py-2 bg-emerald-500 text-white rounded"
                >
                  {transactionLoading ? "Processing..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Summary Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Transaction Summary</h2>
            <div className="mb-4">
              <textarea
                ref={summaryTextRef}
                className="w-full p-4 border rounded bg-gray-50 text-sm font-mono h-64 overflow-y-auto"
                readOnly
                value={generateSummaryText()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Close
              </button>
              <button
                onClick={handleCopyToClipboard}
                className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-1"
              >
                {copySuccess ? (
                  <>
                    <span>✓ Copied!</span>
                  </>
                ) : (
                  <>
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
