interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  value: number;
  change: number;
}

interface HoldingTableProps {
  holdings: Holding[];
}

export default function HoldingTable({ holdings }: HoldingTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Change
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {holdings.map((holding) => (
            <tr key={holding.symbol}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {holding?.symbol}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {holding?.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {holding?.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                ${holding.price?.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                ${holding.value?.toLocaleString()}
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                  holding.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {holding.change >= 0 ? "+" : ""}
                {holding.change}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
