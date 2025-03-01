import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate

export default function CreditPage() {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [formData, setFormData] = useState({
    customerName: "",
    customerNumber: "",
    company: "",
    selectedAccount: "",
    selectedNumber: "",
    newAmount: 0,
    remarks: "",
    entryBy: "",
    statement: "",
  });

  const [companyData, setCompanyData] = useState([]);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // Add validation error state
  const [validationError, setValidationError] = useState("");

  // Get user from localStorage and set entryBy when component mounts
  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        if (userData && userData.name) {
          // Check if name is "Rajib" or "Rony" and set accordingly
          if (userData.name === "Rajib") {
            setFormData((prev) => ({ ...prev, entryBy: "Rajib" }));
          } else if (userData.name === "Rony") {
            setFormData((prev) => ({ ...prev, entryBy: "Rony" }));
          } else {
            // For any other name, default behavior
            setFormData((prev) => ({ ...prev, entryBy: userData.name }));
          }
        }
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
  }, []);

  // Fetch data when company is selected
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!formData.company) return;

      try {
        const response = await axios.get(
          `https://bebsa.ahadalichowdhury.online/api/mobileAccounts/company?selectCompany=${encodeURIComponent(
            formData.company
          )}`
        );

        if (response.data.success) {
          setCompanyData(response.data.data);
          setFormData((prev) => ({
            ...prev,
            selectedAccount: "",
            selectedNumber: "",
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
    const selectedAccount = companyData.find(
      (item) => item.mobileNumber === selectedMobile
    );
    if (selectedAccount) {
      setFormData((prev) => ({
        ...prev,
        selectedAccount: selectedMobile,
        selectedNumber: selectedAccount.totalAmount.toString(),
      }));
    }
  };

  // Modified to fetch customer suggestions by both name and number
  const fetchCustomerSuggestions = async (searchInput) => {
    if (!searchInput || searchInput.trim() === "") {
      setCustomerSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // First try to search by the input as provided (could be name or number)
      const response = await axios.get(
        `https://bebsa.ahadalichowdhury.online/api/customers/search?customer=${encodeURIComponent(
          searchInput
        )}`
      );

      let foundCustomers = [];
      if (response.data.success) {
        foundCustomers = response.data.data;
      }

      // If the search input could be a partial phone number, try to match by mobile number directly
      // This provides a fallback search method if the API doesn't handle number searches well
      if (/^\d+$/.test(searchInput)) {
        // Additional search for numbers only if the input contains only digits
        try {
          const numberResponse = await axios.get(
            `https://bebsa.ahadalichowdhury.online/api/customers/search?mobileNumber=${encodeURIComponent(
              searchInput
            )}`
          );

          if (
            numberResponse.data.success &&
            numberResponse.data.data.length > 0
          ) {
            // Add any new results that weren't already found
            numberResponse.data.data.forEach((customer) => {
              if (!foundCustomers.some((c) => c._id === customer._id)) {
                foundCustomers.push(customer);
              }
            });
          }
        } catch (error) {
          // Silently continue if the second endpoint doesn't exist
          console.log("Mobile number specific search not available");
        }
      }

      // Set results even if we just have results from the first search
      setCustomerSuggestions(foundCustomers);
      setShowSuggestions(foundCustomers.length > 0);
    } catch (error) {
      console.error("Error fetching customer suggestions:", error);
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFormData((prev) => ({
      ...prev,
      customerName: value, // Update customer name as they type (for backward compatibility)
    }));
    fetchCustomerSuggestions(value);
  };

  // Client-side filtering for number search if the API doesn't handle it
  useEffect(() => {
    if (searchTerm && /^\d+$/.test(searchTerm)) {
      // If the search term is numeric, filter results client-side as well
      const filteredResults = customerSuggestions.filter((customer) =>
        customer.mobileNumber.includes(searchTerm)
      );

      if (filteredResults.length > 0) {
        setCustomerSuggestions(filteredResults);
      }
    }
  }, [searchTerm, customerSuggestions.length]);

  // Handle selection from dropdown
  const handleSelectCustomer = (customer) => {
    setFormData((prev) => ({
      ...prev,
      customerName: customer.customerName,
      customerNumber: customer.mobileNumber,
    }));
    setSearchTerm(customer.customerName);
    setCustomerSuggestions([]);
    setShowSuggestions(false);
  };

  // Function to handle statement button click with validation
  const handleStatementClick = (e) => {
    e.preventDefault(); // Prevent default Link behavior

    // Validate if company and account are selected
    if (!formData.company) {
      setValidationError(
        "Please select a company before proceeding to statement"
      );
      return;
    }

    if (!formData.selectedAccount) {
      setValidationError(
        "Please select a number before proceeding to statement"
      );
      return;
    }

    // If validation passes, clear any errors and navigate to statement page with params
    setValidationError("");

    // Get current date in YYYY-MM-DD format for default date range
    const today = new Date().toISOString().split("T")[0];

    // Navigate to statement page with query parameters
    navigate(
      `/statement?selectCompany=${encodeURIComponent(
        formData.company
      )}&selectedNumber=${encodeURIComponent(
        formData.selectedAccount
      )}&startDate=${today}&endDate=${today}`
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `https://bebsa.ahadalichowdhury.online/api/credit`,
        formData
      );
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
        entryBy: formData.entryBy, // Keep the current entryBy value
        statement: "",
      });
      setSearchTerm("");
      setCompanyData([]);
    } catch (error) {
      console.error(
        "Error submitting transaction:",
        error.response?.data || error.message
      );
      alert("Failed to submit transaction. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-8">Credit</h1>

      {/* Show validation error message if exists */}
      {validationError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{validationError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              Search Customer (Name or Number)
            </label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              value={searchTerm}
              onChange={handleSearchInputChange}
              placeholder="Enter name or number"
              autoComplete="off"
            />
            {showSuggestions && customerSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                {customerSuggestions.map((customer) => (
                  <li
                    key={customer._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <span className="font-medium">{customer.customerName}</span>
                    <span className="text-gray-600">
                      {customer.mobileNumber}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Customer Number
            </label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              value={formData.customerNumber}
              onChange={(e) =>
                setFormData({ ...formData, customerNumber: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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
            <label className="block text-sm font-medium mb-1">
              Stock Balance
            </label>
            <input
              type="string"
              className="w-full border rounded-md p-2"
              value={formData.selectedNumber}
              readOnly
            />

            <p>
              Total:{" "}
              {Number(formData.newAmount) + Number(formData.selectedNumber)}
            </p>
          </div>
          <div>
            <label className=" text-sm font-medium mb-1">CreditAmount</label>
            <input
              type="number"
              className="w-full border rounded-md p-2"
              value={formData.newAmount === 0 ? "" : formData.newAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  newAmount:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
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

        <div className="flex justify-between pt-4">
          <Link
            to="/"
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
          >
            Back
          </Link>
          {/* Replace Link with button for validation */}
          <button
            onClick={handleStatementClick}
            className="bg-[color:oklch(0.852_0.199_91.936)] text-black px-6 py-2 rounded-md hover:bg-[color:oklch(0.421 0.095 57.708)]"
          >
            Statement
          </button>

          <button
            type="submit"
            className="bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
