interface InsightSummaryProps {
  title: string;
  insights: {
    text: string;
    sentiment: "positive" | "negative" | "neutral";
  }[];
}

export default function InsightSummary({
  title,
  insights,
}: InsightSummaryProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-md ${
              insight.sentiment === "positive"
                ? "bg-green-900/30"
                : insight.sentiment === "negative"
                ? "bg-red-900/30"
                : "bg-gray-800/30"
            }`}
          >
            <p className="text-white">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
