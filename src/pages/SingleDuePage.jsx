import axios from "axios";
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

    let summary = `Customer: ${customerData.customerName}\n`;
    summary += `Mobile: ${customerData.mobileNumber}\n`;
    summary += `Due Balance: ৳ ${customerData.dueBalance}\n`;
    summary += `Total Given: ৳ ${customerData.totalGiven}\n`;
    summary += `Total Taken: ৳ ${customerData.totalTaken}\n\n`;
    summary += "Transaction History:\n";

    customerData.transactions.forEach((transaction, index) => {
      summary += `${index + 1}. Date: ${formatDate(transaction.date)}\n`;
      if (transaction.given > 0) {
        summary += `   Credit: ৳ ${transaction.taken}\n`;
      }
      if (transaction.taken > 0) {
        summary += `   Debit: ৳ ${transaction.given}\n`;
      }
      summary += `   Balance: ৳ ${transaction.balance}\n\n`;
    });

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

  // Skeleton loading UI
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-300 p-4 rounded-t-lg">
          <h1 className="text-xl font-bold">Due History</h1>
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
                <th className="text-left p-2">তারিখ</th>
                <th className="text-right p-2">নিয়েছি</th>
                <th className="text-right p-2">দিয়েছি</th>
                <th className="text-right p-2">ব্যালেন্স</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(4)].map((_, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </td>
                  <td className="text-right p-2">
                    <div className="h-4 bg-gray-200 rounded w-16 ml-auto animate-pulse"></div>
                  </td>
                  <td className="text-right p-2">
                    <div className="h-4 bg-gray-200 rounded w-16 ml-auto animate-pulse"></div>
                  </td>
                  <td className="text-right p-2">
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

      <div className="bg-yellow-300 p-4 rounded-t-lg">
        <h1 className="text-xl font-bold">Due History</h1>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold">
              {customerData.customerName} (Customer)
            </div>
            <div>{customerData.mobileNumber}</div>
            <div className="text-red-500">
              Branch: ৳ {customerData.dueBalance}
            </div>
          </div>
          <div className="flex gap-2">
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
          </div>
        </div>
      </div>

      {/* View Button */}
      <div className="mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={() => setShowViewModal(true)}
        >
          View Summary
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Date</th>
              <th className="text-right p-2">Credit</th>
              <th className="text-right p-2">Debit</th>
              <th className="text-right p-2">Balance</th>
            </tr>
          </thead>
          <tbody>
            {customerData.transactions.map((transaction) => (
              <tr key={transaction._id} className="border-b">
                <td className="p-2">{formatDate(transaction.date)}</td>
                <td className="text-right p-2 text-emerald-600">
                  {transaction.taken > 0 ? `৳ ${transaction.given}` : "-"}
                </td>
                <td className="text-right p-2 text-red-600">
                  {transaction.given > 0 ? `৳ ${transaction.taken}` : "-"}
                </td>
                <td className="text-right p-2">৳ {transaction.balance}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td className="p-2">Total</td>
              <td className="text-right p-2 text-emerald-600">
                ৳ {customerData.totalGiven}
              </td>
              <td className="text-right p-2 text-red-600">
                ৳ {customerData.totalTaken}
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
