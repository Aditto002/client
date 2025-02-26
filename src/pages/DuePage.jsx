import { Link } from "react-router-dom"

export default function DuePage() {
  const transactions = [
    { date: "08 February, 2025", credit: 700, debit: 1250, balance: 1250 },
    { date: "08 February, 2025", credit: 800, debit: 2050, balance: 2050 },
    { date: "08 February, 2025", credit: 2050, debit: 0, balance: 0 },
    { date: "09 February, 2025", credit: 72000, debit: 72000, balance: 72000, note: "From Tallykhata" },
    { date: "09 February, 2025", credit: 72000, debit: 0, balance: 0 },
    { date: "11 February, 2025", credit: 50, debit: 50, balance: 50 },
  ]

  const totals = {
    credit: 75050,
    debit: 75100,
    balance: 50,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-yellow-300 p-4 rounded-t-lg">
        <h1 className="text-xl font-bold">Due History</h1>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold">RONY (Customer)</div>
            <div>01730923222</div>
            <div className="text-red-500">Branch: ৳ 50</div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-gray-200">
              <span className="sr-only">Call</span>📞
            </button>
            <button className="p-2 rounded-full bg-gray-200">
              <span className="sr-only">Message</span>💬
            </button>
          </div>
        </div>
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
            {transactions.map((transaction, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">
                  {transaction.date}
                  {transaction.note && <div className="text-sm text-gray-500">{transaction.note}</div>}
                </td>
                <td className="text-right p-2 text-emerald-600">
                  {transaction.credit > 0 ? `৳ ${transaction.credit}` : "-"}
                </td>
                <td className="text-right p-2 text-red-600">
                  {transaction.debit > 0 ? `৳ ${transaction.debit}` : "-"}
                </td>
                <td className="text-right p-2">৳ {transaction.balance}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td className="p-2">Total</td>
              <td className="text-right p-2 text-emerald-600">৳ {totals.credit}</td>
              <td className="text-right p-2 text-red-600">৳ {totals.debit}</td>
              <td className="text-right p-2">৳ {totals.balance}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <button className="bg-red-500 text-white p-4 rounded-lg text-center font-bold">Give</button>
        <button className="bg-emerald-500 text-white p-4 rounded-lg text-center font-bold">Take</button>
      </div>

      <div className="flex justify-center mt-6">
        <Link to="/" className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
