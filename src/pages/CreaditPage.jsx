import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function CreditPage() {
  const [formData, setFormData] = useState({
    customerName: "",
    customerNumber: "",
    company: "", // Default value
    selectedAccount: "",
    selectedNumber: "",
    newAmount: 0,
    remarks: "",
    entryBy: "aditto",
    statement: "",
  });

  const [companyData, setCompanyData] = useState([]); // Store fetched company details
  const [customerSuggestions, setCustomerSuggestions] = useState([]); // Store fetched customer data
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [totalnumber, setTotalnumber] = useState(false);

  // Fetch data when company is selected
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!formData.company) return; // Exit if no company is selected

      try {
        const response = await axios.get(
          `http://localhost:5000/api/mobileAccounts/company?selectCompany=${encodeURIComponent(formData.company)}`
        );

        if (response.data.success) {
          setCompanyData(response.data.data); // Store all company data
          setFormData((prev) => ({
            ...prev,
            selectedAccount: "",
            selectedNumber: "", // Reset when company changes
          }));
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };

    fetchCompanyDetails();
  }, [formData.company]);

  // Handle number selection and update credit amount
  const handleNumberSelection = (selectedMobile) => {
    const selectedAccount = companyData.find((item) => item.mobileNumber === selectedMobile);
    if (selectedAccount) {
      setFormData((prev) => ({
        ...prev,
        selectedAccount: selectedMobile,
        selectedNumber: selectedAccount.totalAmount.toString(), // Convert to string for input field
      }));
    }
  };
  const fetchCustomerSuggestions = async (name) => {
    if (!name) {
      setCustomerSuggestions([]);
      return;
    }
    if (formData.customerName.trim() === "") {
      setCustomerSuggestions([]);
      setShowDropdown(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/customers/search?customer=${name}`);

      if (response.data.success) {
        setCustomerSuggestions(response.data.data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching customer suggestions:", error);
    }
  };
  

  // Handle customer name input change
  const handlecustomerNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, customerName: name }));
    fetchCustomerSuggestions(name);
  };
  const handleSelectCustomer = (customer) => {
    setFormData((prev) => ({
      ...prev,
      customerName: customer.customerName,
      customerNumber: customer.mobileNumber,
    }));
    setCustomerSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      console.log(formData)
      const response = await axios.post("http://localhost:5000/api/credit", formData);
      console.log("Success:", response.data);
      alert("Transaction submitted successfully!");

      // Reset form after successful submission
      setFormData({
        customerName: "",
        customerNumber: "",
        company: "",
        selectedAccount: "",
        selectedNumber: "",
        newAmount: 0,
        remarks: "",
        entryBy: "aditto",
        statement: "",
      });
      setCompanyData([]); // Clear company data
    } catch (error) {
      console.error("Error submitting transaction:", error.response?.data || error.message);
      alert("Failed to submit transaction. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-8">Daily Transaction Register</h1>
      <div className="text-emerald-500 font-bold text-xl mb-6">Credit</div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
        <div className="relative">
            <label className="block text-sm font-medium mb-1">Customer Name</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              value={formData.customerName}
              onChange={handlecustomerNameChange}
              required
              autoComplete="off"
            />
            {showSuggestions && customerSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                {customerSuggestions.map((customer) => (
                  <li
                    key={customer._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    {customer.customerName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Customer Number</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              value={formData.customerNumber}
              onChange={(e) => setFormData({ ...formData, customerNumber: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Select Company</label>
            <select
              className="w-full border rounded-md p-2 bg-white"
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
              className="w-full border rounded-md p-2 bg-white"
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
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Credit Amount</label>
            <input
              type="string"
              className="w-full border rounded-md p-2"
              value={formData.selectedNumber}
              readOnly
            />
            
            <p>Total: {Number(formData.newAmount) + Number(formData.selectedNumber)}</p>
          </div>
          <div>
            <label className=" text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              className="w-full border rounded-md p-2"
              // value={formData.newAmount}
              // onChange={(e) => setFormData({ ...formData, newAmount: Number(e.target.value)})}
              value={formData.newAmount === 0 ? "" : formData.newAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  newAmount: e.target.value === "" ? "" : Number(e.target.value),
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
          <label className="block text-sm font-medium mb-1">Entry By</label>
          <select
              className="w-full border rounded-md p-2 bg-white"
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
            required
          /> */}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Statement</label>
          <input
            type="text"
            className="w-full border rounded-md p-2"
            value={formData.statement}
            onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
          />
        </div>

        <div className="flex justify-between pt-4">
          <Link to="/" className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600">
            Back
          </Link>
          <button type="submit" className="bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
