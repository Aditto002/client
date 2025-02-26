import { Link } from "react-router-dom"
import { useState, useEffect } from "react";
import axios from "axios";
export default function DebitPage() {
  const [companyData, setCompanyData] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState();
  const [formData, setFormData] = useState({
    company: "",
    amount: 0,
    remarks: "",
    statement:"",
    entryBy: "aditto",
  })
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!formData.company) return; // Exit if no company is selected

      try {
        const response = await axios.get(
          `http://localhost:5000/api/mobileAccounts/company?selectCompany=${encodeURIComponent(formData.company)}`
        );

        if (response.data.success) {
          setCompanyData(response.data.data); // Store all company data
          console.log("number",response.data.data)
          setFormData((prev) => ({
            ...prev,
            selectedAccount: "",
          //  setSelectedAmount: "", // Reset when company changes
          }));
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };

    fetchCompanyDetails();
  }, [formData.company]);
  const handleNumberSelection = (selectedMobile) => {
    const selectedAccount = companyData.find((item) => item.mobileNumber === selectedMobile);
    if (selectedAccount) {
      setFormData((prev) => ({
        ...prev,
        selectedAccount: selectedMobile,
     //   selectedNumber: selectedAccount.totalAmount.toString(), // Convert to string for input field
      }));
      setSelectedAmount(selectedAccount.totalAmount.toString())
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault()
    console.log(formData)
    try {
      console.log(formData)
      const response = await axios.post("http://localhost:5000/api/debit", formData);
      console.log("Success:", response.data);
      alert("submitted successfully!");

      // Reset form after successful submission
      setFormData({
        company: "",
        amount: 0,
        remarks: "",
        statement:"",
        entryBy: "aditto",
      });
      setCompanyData([]); // Clear company data
    } catch (error) {
      console.error("Error submitting transaction:", error.response?.data || error.message);
      alert("Failed to submit transaction. Please try again.");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-8">Daily Transaction Register</h1>
      <div className="text-emerald-500 font-bold text-xl mb-6">Debit</div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Select Company</label>
          <select
              className="w-full border rounded-md p-2"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
          <label className="block text-sm font-medium mb-1">Select Number</label>
          <select
              className="w-full border rounded-md p-2"
              value={formData.selectedAccount}
              onChange={(e) => handleNumberSelection(e.target.value)}
              required
            >
              <option value="">Select a number</option>
              {companyData.map((item) => (
                <option key={item._id} value={item.mobileNumber}>
                  {item.mobileNumber}
                </option>
              ))}
            </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Stock Balance</label>
            <div className="flex items-center gap-2">
            <input
              type="string"
              className="w-full border rounded-md p-2"
              // value={formData.selectedNumber}
              value={selectedAmount}
              readOnly
            />
            
            </div>
            <div className="text-sm text-gray-500 mt-1">Total :{0>(Number(selectedAmount)- Number(formData.amount))?<span className="text-red-600">{Number(selectedAmount)- Number(formData.amount)}</span>:<span className="text-green-500">{Number(selectedAmount)- Number(formData.amount)}</span>}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Debit Amount</label>
            <input
              type="number"
              className="w-full border rounded-md p-2"
              value={formData.amount === 0 ? "" : formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Remarks</label>
          <textarea
            className="w-full border rounded-md p-2"
            rows="3"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Statement</label>
          <textarea
            className="w-full border rounded-md p-2"
            rows="3"
            value={formData.statement}
            onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Entry By</label>
          <select
              className="w-full border rounded-md p-2"
              value={formData.entryBy}
              onChange={(e) => setFormData({ ...formData, entryBy: e.target.value })}
              required
            >
              <option value="aditto">Aditto</option>
              <option value="ahad">Ahad</option>
            </select>
          {/* <input
            type="text"
            className="w-full border rounded-md p-2"
            value={formData.entryBy}
            onChange={(e) => setFormData({ ...formData, entryBy: e.target.value })}
          /> */}
          <div className="text-sm text-gray-500 mt-1">2 (Jon er Nam)</div>
        </div>

        <div className="flex justify-between pt-4">
          <Link to="/" className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600">
            Back
          </Link>
          
          {0 > (Number(selectedAmount) - Number(formData.amount)) ? (
  <button type="submit"disabled className="bg-emerald-200 text-white px-6 py-2 rounded-md ">
    Submit
  </button>
) : (
  <button
    type="submit"
    
    className="bg-emerald-500 text-white px-6 py-2 rounded-md cursor-not-allowed"
  >
    Submit
  </button>
)}
        </div>
      </form>

      <div className="text-center text-3xl text-red-500 font-bold mt-8">Demo Page-2</div>
    </div>
  )
}
