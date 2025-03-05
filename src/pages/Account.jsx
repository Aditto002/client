import { useState, useEffect } from "react"
import axios from "axios"
import {
  FiUser,
  FiEdit,
  FiTrash,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiSearch
} from "react-icons/fi"
import { Link } from "react-router-dom"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const MobileAccounts = () => {
    const [transactions, setTransactions] = useState([])
    const [totalAmount, setTotalAmount] = useState({totalAmount: 0})
    const [expandedRow, setExpandedRow] = useState(null)
    const [startDate, setStartDate] = useState("") 
    const [endDate, setEndDate] = useState("") 
    const [tempStartDate, setTempStartDate] = useState("") 
    const [tempEndDate, setTempEndDate] = useState("") 

    // State for create modal
    const [showModal, setShowModal] = useState(false)
    const [selectCompany, setSelectCompany] = useState("Nagad Personal")
    const [mobileNumber, setMobileNumber] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    // State for update modal
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [updateAccountId, setUpdateAccountId] = useState("")
    const [updateSelectCompany, setUpdateSelectCompany] = useState("Nagad Personal")
    const [updateMobileNumber, setUpdateMobileNumber] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [updateError, setUpdateError] = useState("")

    // State for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteAccountId, setDeleteAccountId] = useState("")
    const [deleteAccountNumber, setDeleteAccountNumber] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    // New state for account search and results
    const [searchQuery, setSearchQuery] = useState("")
    const [accounts, setAccounts] = useState([])
    const [isSearching, setIsSearching] = useState(false)

    // Company options
    const companyOptions = ['Bkash Personal',
          'Bkash Agent',
          'Nagad Personal',
          'Nagad Agent',
          'Rocket Personal',
          'Rocket Agent',
        'Others']

  useEffect(() => {
    fetchTransactions()
  }, [startDate, endDate])

  useEffect(() => {
    // Fetch accounts when search query changes
    fetchAccounts()
  }, [searchQuery])

  const fetchTransactions = async () => {
    try {
      // Prepare params object, only including dates if they have values
      const params = {}

      // Only add date parameters if they're not empty
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await axios.get("https://bebsa.ahadalichowdhury.online/api/mobileAccounts", {
        params: params,
      })
      setTransactions(response.data.data.accounts)
      setTotalAmount(response.data.data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Failed to fetch transactions. Please try again.")
    }
  }

  // Function to fetch accounts from the API
  const fetchAccounts = async () => {
    try {
      setIsSearching(true)
      const params = {
        // Remove pagination params to fetch all accounts
        limit: 1000, // Large number to fetch all accounts
      }

      // Only add search parameter if it has a value
      if (searchQuery) params.search = searchQuery

      const response = await axios.get("https://bebsa.ahadalichowdhury.online/api/mobileAccounts/account-datas", {
        params: params,
      })

      setAccounts(response.data.data)
    } catch (error) {
      console.error("Error fetching accounts:", error)
      toast.error("Failed to fetch accounts. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
  }

  // Rest of the component remains the same...
  // (I'm keeping all other methods like handleCreateAccount, 
  // openUpdateModal, handleUpdateAccount, etc. unchanged)
  
  const handleCreateAccount = async () => {
    // Validate inputs
    if (!selectCompany.trim()) {
      setError("Company selection is required");
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
        "https://bebsa.ahadalichowdhury.online/api/mobileAccounts",
        {
          selectCompany,
          mobileNumber,
        }
      );

      console.log("Account created:", response.data);

      // Close modal and reset form
      setShowModal(false);
      setSelectCompany("Nagad Personal");
      setMobileNumber("");

      // Show success toast
      toast.success(`Account created successfully: ${mobileNumber}`);

      // Refresh accounts list
      fetchAccounts();
    } catch (error) {
      console.error("Error creating account:", error);
      setError(
        error.response?.data?.message ||
          "Failed to create account. Please try again."
      );
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUpdateAccount = async () => {
    // Validate inputs
    if (!updateSelectCompany.trim()) {
      setUpdateError("Company selection is required");
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
        `https://bebsa.ahadalichowdhury.online/api/mobileAccounts/${updateAccountId}`,
        {
          selectCompany: updateSelectCompany,
          mobileNumber: updateMobileNumber,
        }
      );

      console.log("Account updated:", response.data);

      // Close modal and reset form
      setShowUpdateModal(false);
      setUpdateAccountId("");
      setUpdateSelectCompany("Nagad Personal");
      setUpdateMobileNumber("");

      // Show success toast
      toast.success(`Account updated successfully: ${updateMobileNumber}`);

      // Refresh accounts list
      fetchAccounts();
    } catch (error) {
      console.error("Error updating account:", error);
      setUpdateError(
        error.response?.data?.message ||
          "Failed to update account. Please try again."
      );
      toast.error("Failed to update account. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);

      await axios.delete(
       ` https://bebsa.ahadalichowdhury.online/api/mobileAccounts/${deleteAccountId}`
      );

      console.log("Account deleted successfully");

      // Close modal and reset state
      setShowDeleteModal(false);
      setDeleteAccountId("");

      // Show success toast
      toast.success(`Account deleted successfully: ${deleteAccountNumber}`);
      setDeleteAccountNumber("");

      // Refresh accounts list
      fetchAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };
  const openUpdateModal = (account) => {
    setUpdateAccountId(account._id)
    setUpdateSelectCompany(account.selectCompany)
    setUpdateMobileNumber(account.mobileNumber)
    setUpdateError("")
    setShowUpdateModal(true)
  }
  const openDeleteModal = (account) => {
    setDeleteAccountId(account._id)
    setDeleteAccountNumber(account.mobileNumber)
    setShowDeleteModal(true)
  }
  return (
    <div className="container mx-auto p-4 max-w-5xl">
        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        <div className="text-center mb-10 mt-10">
          <h1 className="text-4xl font-bold">Accounts</h1>
        </div>

        <div className="flex items-center gap-4 md:gap-6 md:mb-4">
          <div className="flex justify-between items-center gap-5 md:gap-7">
            {/* Search Input with Icon */}
            <div className="flex flex-col relative">
              <div className="flex items-center">
                <div className="absolute left-3 text-gray-400">
                  <FiSearch size={18} />
                </div>
                <input
                  type="search"
                  placeholder="Search by mobile number..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 p-2 border rounded w-40 sm:w-52 md:w-96"
                />
              </div>
            </div>

            {/* Create Button */}
            <div className="ml-auto text-lg font-semibold md:ml-96">
              <button
                className="bg-green-500 py-2 px-12 md:ml-5 rounded-lg text-white hover:bg-green-600 transition-colors"
                onClick={() => setShowModal(true)}
              >
                Create
              </button>
            </div>
          </div>
        </div>

        {/* Account List Section */}
        <div className="mt-8">
          {/* Desktop View for Accounts */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-gray-500 font-medium">Company</th>
                  <th className="text-left py-4 px-6 text-gray-500 font-medium">Mobile Number</th>
                  <th className="text-left py-4 px-6 text-gray-500 font-medium">Total Amount</th>
                  <th className="text-left py-4 px-6 text-gray-500 font-medium">Created At</th>
                  <th className="text-left py-4 px-6 text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account, index) => (
                  <tr
                    key={account._id}
                    className={`border-b border-gray-200 ${index % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-gray-900">{account.selectCompany}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{account.mobileNumber}</td>
                    <td className="py-4 px-6 text-gray-700">{account.totalAmount}</td>
                    <td className="py-4 px-6 text-gray-700">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => openUpdateModal(account)}
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => openDeleteModal(account)}
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

          {/* Mobile View for Accounts */}
          <div className="md:hidden space-y-4">
            {accounts.map((account) => (
              <div key={account._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{account.selectCompany}</div>
                        <div className="text-sm text-gray-500">{account.mobileNumber}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedRow(expandedRow === account._id ? null : account._id)}
                      className="text-gray-500"
                    >
                      {expandedRow === account._id ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </button>
                  </div>

                  {expandedRow === account._id && (
                    <div className="mt-4 space-y-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-gray-500">Company:</div>
                        <div className="text-sm text-gray-900">{account.selectCompany}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-gray-500">Mobile Number:</div>
                        <div className="text-sm text-gray-900">{account.mobileNumber}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-gray-500">Total Amount:</div>
                        <div className="text-sm text-gray-900">{account.totalAmount}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-gray-500">Created At:</div>
                        <div className="text-sm text-gray-900">
                          {new Date(account.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="pt-3">
                        <div className="flex justify-between">
                          <button
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                            onClick={() => openUpdateModal(account)}
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                            onClick={() => openDeleteModal(account)}
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

          {/* Back Button */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="bg-gray-500 mt-6 text-white px-6 py-2 rounded-md hover:bg-gray-600"
            >
              Back
            </Link>
          </div>
        </div>
        {/* Create Account Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create New Mobile Account</h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setError("")
                    setSelectCompany("Nagad Personal")
                    setMobileNumber("")
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
                  <label htmlFor="selectCompany" className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <select
                    id="selectCompany"
                    value={selectCompany}
                    onChange={(e) => setSelectCompany(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {companyOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
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
                      setShowModal(false)
                      setError("")
                      setSelectCompany("Nagad Personal")
                      setMobileNumber("")
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreateAccount}
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                      isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Account Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Update Mobile Account</h2>
                <button
                  onClick={() => {
                    setShowUpdateModal(false)
                    setUpdateError("")
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
                  <label htmlFor="updateSelectCompany" className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <select
                    id="updateSelectCompany"
                    value={updateSelectCompany}
                    onChange={(e) => setUpdateSelectCompany(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {companyOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="updateMobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
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
                      setShowUpdateModal(false)
                      setUpdateError("")
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleUpdateAccount}
                    disabled={isUpdating}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                      isUpdating ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    {isUpdating ? "Updating..." : "Update Account"}
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
                <h2 className="text-xl font-bold">Delete Mobile Account</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteAccountId("")
                    setDeleteAccountNumber("")
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete the account with number <span className="font-semibold">{deleteAccountNumber}</span>?
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteAccountId("")
                    setDeleteAccountNumber("")
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteAccount}
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
  )
}

export default MobileAccounts