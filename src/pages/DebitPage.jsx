import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function DebitPage() {
  const [companyData, setCompanyData] = useState([])
  const [selectedAmount, setSelectedAmount] = useState()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    company: '',
    amount: 0,
    remarks: '',
    currentAmount: 0,
    statement: '',
    entryBy: '',
  })

  useEffect(() => {
    const userString = localStorage.getItem('user')
    if (userString) {
      try {
        const userData = JSON.parse(userString)
        if (userData && userData.name) {
          // Check if name is "Rajib" or "Rony" and set accordingly
          if (userData.name === 'Rajib') {
            setFormData((prev) => ({ ...prev, entryBy: 'Rajib' }))
          } else if (userData.name === 'Rony') {
            setFormData((prev) => ({ ...prev, entryBy: 'Rony' }))
          } else {
            // For any other name, default behavior
            setFormData((prev) => ({ ...prev, entryBy: userData.name }))
          }
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e)
      }
    }
  }, [])

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!formData.company) {
        setCompanyData([])
        return
      }

      try {
        const response = await axios.get(
          `https://bebsa-backend.onrender.com/api/mobileAccounts/company?selectCompany=${encodeURIComponent(
            formData.company
          )}`
        )

        if (response.data && response.data.success) {
          setCompanyData(response.data.data || [])
          
          // If there's a selected account, update its details
          if (formData.selectedAccount) {
            const selectedAccount = response.data.data.find(
              (item) => item && item.mobileNumber === formData.selectedAccount
            )

            if (selectedAccount && selectedAccount.totalAmount !== undefined) {
              setSelectedAmount(selectedAccount.totalAmount.toString())
              setFormData((prev) => ({
                ...prev,
                currentAmount: selectedAccount.totalAmount,
              }))
            }
          } else {
            setFormData((prev) => ({
              ...prev,
              selectedAccount: '',
            }))
            setSelectedAmount('')
          }
        } else {
          setCompanyData([])
        }
      } catch (error) {
        console.error('Error fetching company details:', error)
        toast.error('Failed to fetch company details')
        setCompanyData([])
      }
    }

    fetchCompanyDetails()
  }, [formData.company])

  const handleNumberSelection = (selectedMobile) => {
    if (!selectedMobile) {
      setFormData((prev) => ({
        ...prev,
        selectedAccount: "",
      }))
      setSelectedAmount("")
      return
    }

    const selectedAccount = companyData.find(
      (item) => item && item.mobileNumber === selectedMobile
    )
    
    if (selectedAccount && selectedAccount.totalAmount !== undefined) {
      setFormData((prev) => ({
        ...prev,
        selectedAccount: selectedMobile,
        currentAmount: selectedAccount.totalAmount,
      }))
      setSelectedAmount(selectedAccount.totalAmount.toString())
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedAccount: selectedMobile,
        currentAmount: 0,
      }))
      setSelectedAmount("0")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSubmitting) return // Prevent double-click
    setIsSubmitting(true)     // Lock submit

    // Validate required fields before submission
    if (!formData.company || !formData.selectedAccount) {
      toast.error("Company and number selection is required")
      setIsSubmitting(false)
      return
    }

    if (!formData.amount || formData.amount <= 0) {
      toast.error("Please enter a valid debit amount")
      setIsSubmitting(false)
      return
    }

    // Check if debit amount exceeds balance
    if (Number(formData.amount) > Number(selectedAmount)) {
      toast.error("Debit amount cannot exceed available balance")
      setIsSubmitting(false)
      return
    }

    try {
      console.log('data', formData)
      const response = await axios.post(
        'https://bebsa-backend.onrender.com/api/debit',
        formData
      )
      console.log('Success:', response.data)
      toast.success('Transaction submitted successfully!')

      // After successful submission, refetch the updated balance
      try {
        const updatedCompanyResponse = await axios.get(
          `https://bebsa-backend.onrender.com/api/mobileAccounts/company?selectCompany=${encodeURIComponent(
            formData.company
          )}`
        )

        if (updatedCompanyResponse.data && updatedCompanyResponse.data.success) {
          const updatedAccount = updatedCompanyResponse.data.data.find(
            (item) => item && item.mobileNumber === formData.selectedAccount
          )

          if (updatedAccount && updatedAccount.totalAmount !== undefined) {
            setSelectedAmount(updatedAccount.totalAmount.toString())
            setFormData((prev) => ({
              ...prev,
              amount: 0,
              remarks: "",
              currentAmount: updatedAccount.totalAmount,
            }))
          }
        }
      } catch (error) {
        console.error("Error fetching updated balance:", error)
        // Still reset basic fields
        setFormData((prev) => ({
          ...prev,
          amount: 0,
          remarks: "",
        }))
      }
    } catch (error) {
      console.error(
        'Error submitting transaction:',
        error.response?.data || error.message
      )
      toast.error('Failed to submit transaction. Please try again.')
    } finally {
      setIsSubmitting(false) // Re-enable submit
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <h1 className="text-3xl font-bold text-center mb-8">Debit</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Company
          </label>
          <select
            className="w-full border rounded-md p-2 bg-white"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            required
          >
            <option value=""></option>
            <option value="Bkash Personal">Bkash Personal</option>
            <option value="Bkash Agent">Bkash Agent</option>
            <option value="Nagad Personal">Nagad Personal</option>
            <option value="Nagad Agent">Nagad Agent</option>
            <option value="Rocket Personal">Rocket Personal</option>
            <option value="Rocket Agent">Rocket Agent</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Select Number
          </label>
          <select
            className="w-full border rounded-md p-2 bg-white"
            value={formData.selectedAccount}
            onChange={(e) => handleNumberSelection(e.target.value)}
            required
          >
            <option value="">Select a number</option>
            {companyData && companyData.length > 0
              ? companyData.map((item) =>
                  item && item._id && item.mobileNumber ? (
                    <option key={item._id} value={item.mobileNumber}>
                      {item.mobileNumber}
                    </option>
                  ) : null
                )
              : null}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Stock Balance
            </label>
            <div className="flex items-center gap-2">
              <input
                type="string"
                className="w-full border rounded-md p-2"
                value={selectedAmount || ""}
                readOnly
              />
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Total :
              {isNaN(Number(selectedAmount)) ||
              isNaN(Number(formData.amount)) ||
              selectedAmount === '' ||
              formData.amount === '' ? (
                ''
              ) : Number(selectedAmount) - Number(formData.amount) < 0 ? (
                <span className="text-red-600">
                  {Number(selectedAmount) - Number(formData.amount)}
                </span>
              ) : (
                <span className="text-green-500">
                  {Number(selectedAmount) - Number(formData.amount)}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Debit Amount
            </label>
            <input
              type="number"
              className="w-full border rounded-md p-2"
              value={formData.amount === 0 ? '' : formData.amount}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Number(e.target.value);
                if (value >= 0) {
                  setFormData({
                    ...formData,
                    amount: value,
                  });
                } else {
                  toast.error('Negative values are not allowed')
                }
              }}
              min="0"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <input
              className="w-full border rounded-md p-2"
              type="text"
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Entry By</label>
            <input
              type="text"
              className="w-full border rounded-md p-2 bg-gray-100"
              value={formData.entryBy}
              readOnly
            />
          </div>
        </div>

        <div className="flex justify-between pt-4 mb-10">
          <Link
            to="/"
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
          >
            Back
          </Link>

          {/* Add Statement button with validation */}
          {/* <button
            onClick={handleStatementClick}
            className="bg-[color:oklch(0.852_0.199_91.936)] text-black px-6 py-2 rounded-md hover:bg-[color:oklch(0.421 0.095 57.708)]"
          >
            Statement
          </button> */}

          {0 > Number(selectedAmount) - Number(formData.amount) ? (
            <button
              type="submit"
              disabled
              className="bg-emerald-200 text-white px-6 py-2 rounded-md cursor-not-allowed"
            >
              Submit
            </button>
          ) : (
            <button
              type="submit"
              className="bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
