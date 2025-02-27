import { Link } from 'react-router-dom';

export default function HomePage() {
  const menuItems = [
    { title: 'Credit', path: '/creditpage' },
    { title: 'Debit', path: '/debitpage' },
    { title: 'DUE', path: '/duepage' },
    { title: 'Add Customer', path: '/add-customer' },
    { title: 'Add Account Number', path: '/add-account' },
    { title: 'Daily Transaction Register', path: '/dailytransation' },
    { title: 'Edit And Delete Entry', path: '/edit' },
    { title: 'Daily Log', path: '/log' },
    { title: 'Total Balance', path: '/balance' },
  ];

  return (
    <div className="container mx-auto px-4 max-w-6xl py-8 ">
      <h1 className="text-3xl mt-6 font-bold text-center justify-center mb-2">Hare Krishna</h1>
      <h1 className="text-5xl font-bold text-center text-teal-800 justify-center mb-2">Deb Telecom</h1>
      <h1 className="text-2xl font-bold text-center justify-center mb-10">Afruzganj Bazar Sherpur,Moulvibazar</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4  justify-center ">
        {menuItems.map((item) => (
          <Link   
            key={item.path}
            to={item.path}
            className="bg-teal-700 text-white p-6 rounded-lg shadow-xs hover:bg-teal-800 transition-colors text-center font-semibold text-lg"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}