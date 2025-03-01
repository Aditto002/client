import { Link, useNavigate } from "react-router-dom";
import imgg from "../../public/imgg.png";

export default function HomePage() {
  const navigate = useNavigate();

  const menuItems = [
    { title: "Credit", path: "/creditpage" },
    { title: "Debit", path: "/debitpage" },
    { title: "DUE", path: "/duepage", disabled: true }, // Mark "DUE" as disabled
    { title: "Customers", path: "/customer" },
    { title: "Accounts", path: "/account" },
    { title: "Daily Transaction Register", path: "/dailytransation" },
    // { title: 'Edit And Delete Entry', path: '/edit' },
    { title: "Daily Log", path: "/dailylog" },
    { title: "Total Balance", path: "/balance" },
  ];

  const handleLogout = () => {
    // Remove auth token and user from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // Navigate to the login page
    navigate("/login");
  };

  return (
    <div className="container mx-auto px-4 max-w-6xl py-8 flex flex-col min-h-screen">
      <div className="flex-grow">
        <h1 className="text-3xl mt-6 font-bold text-center mb-2">
          Hare Krishna
        </h1>
        <img src={imgg} alt="" className="h-24 w-32 mx-auto" />
        <h1 className="text-5xl font-bold text-center text-teal-800 mb-2">
          Deb Telecom
        </h1>
        <h1 className="text-2xl font-bold text-center mb-10">
          Afruzganj Bazar Sherpur, Moulvibazar
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {menuItems.map((item) =>
            item.disabled ? (
              <div
                key={item.path}
                className="bg-gray-400 text-white p-6 rounded-lg shadow-xs opacity-50 text-center font-semibold text-lg cursor-not-allowed"
              >
                {item.title}
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className="bg-teal-700 text-white p-6 rounded-lg shadow-xs hover:bg-teal-800 transition-colors text-center font-semibold text-lg"
              >
                {item.title}
              </Link>
            )
          )}
        </div>
      </div>

      {/* Logout button at the bottom with a different color */}
      <div className="mt-12 mb-6 text-center">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white p-4 px-8 rounded-lg shadow-md hover:bg-red-700 transition-colors font-semibold text-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
