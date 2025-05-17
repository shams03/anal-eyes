interface PortfolioCardProps {
  title: string;
  description?: string;
  value: number;
  change: number;
  hideChangeIndicator?: boolean;
}

export default function PortfolioCard({
  title,
  description,
  value,
  change,
  hideChangeIndicator = false,
}: PortfolioCardProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      {description && <p className="text-gray-300 mb-4">{description}</p>}
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-white">
          $
          {typeof value === "number" && value > 1000
            ? value.toLocaleString(undefined, { maximumFractionDigits: 0 })
            : value.toLocaleString()}
        </span>

        {!hideChangeIndicator && (
          <span
            className={`${change >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
    </div>
  );
}
