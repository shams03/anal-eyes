"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
}

interface PortfolioFormProps {
  userId: string;
  initialData?: {
    id?: string;
    name: string;
    description?: string;
    visibility: "PRIVATE" | "PUBLIC" | "SMART_SHARED";
    cash: number;
    holdings: Holding[];
  };
}

export default function PortfolioForm({
  userId,
  initialData,
}: PortfolioFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    visibility: initialData?.visibility || "PRIVATE",
    cash: initialData?.cash || 0,
  });

  const [holdings, setHoldings] = useState<Holding[]>(
    initialData?.holdings || []
  );
  const [newHolding, setNewHolding] = useState<Holding>({
    symbol: "",
    name: "",
    quantity: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cash" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleHoldingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewHolding((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseFloat(value) || 0 : value,
    }));
  };

  const addHolding = () => {
    if (!newHolding.symbol || !newHolding.name || newHolding.quantity <= 0) {
      setError("Please fill all holding fields with valid values");
      return;
    }

    setHoldings((prev) => [...prev, { ...newHolding }]);
    setNewHolding({ symbol: "", name: "", quantity: 0 });
    setError("");
  };

  const removeHolding = (index: number) => {
    setHoldings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        holdings,
      };

      const url = isEditing
        ? `/api/portfolio/${initialData.id}`
        : "/api/portfolio";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save portfolio");
      }

      const { portfolio } = await response.json();
      router.push(`/portfolio/${portfolio.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-600 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Portfolio Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label
            htmlFor="visibility"
            className="block text-sm font-medium text-gray-700"
          >
            Visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            value={formData.visibility}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="PRIVATE">Private</option>
            <option value="PUBLIC">Public</option>
            <option value="SMART_SHARED">Smart Shared</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="cash"
            className="block text-sm font-medium text-gray-700"
          >
            Cash Amount ($)
          </label>
          <input
            type="number"
            id="cash"
            name="cash"
            value={formData.cash}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium mb-4">Holdings</h3>

        {holdings.length > 0 && (
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holdings.map((holding, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {holding.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {holding.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {holding.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => removeHolding(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label
              htmlFor="symbol"
              className="block text-sm font-medium text-gray-700"
            >
              Symbol
            </label>
            <input
              type="text"
              id="symbol"
              name="symbol"
              value={newHolding.symbol}
              onChange={handleHoldingChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="AAPL"
            />
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Company Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newHolding.name}
              onChange={handleHoldingChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Apple Inc."
            />
          </div>
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700"
            >
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={newHolding.quantity || ""}
              onChange={handleHoldingChange}
              min="0.000001"
              step="0.000001"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="10"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={addHolding}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Holding
            </button>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
              ? "Update Portfolio"
              : "Create Portfolio"}
          </button>
        </div>
      </div>
    </form>
  );
}
