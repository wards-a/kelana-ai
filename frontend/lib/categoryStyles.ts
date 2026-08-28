/**
 * Get category badge styling based on the trip category
 * Backpacker (budget) -> standard (middle) -> Luxury (most elegant)
 */
export function getCategoryBadgeStyle(category: string): {
  bgColor: string;
  textColor: string;
  headerGradient: string;
} {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory === "backpacker") {
    return {
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      headerGradient: "from-green-400 to-emerald-600",
    };
  } else if (normalizedCategory === "standard") {
    return {
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      headerGradient: "from-blue-400 to-blue-600",
    };
  } else if (normalizedCategory === "luxury") {
    return {
      bgColor: "bg-amber-100",
      textColor: "text-amber-900",
      headerGradient: "from-amber-400 via-amber-500 to-amber-700",
    };
  }

  // Fallback
  return {
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    headerGradient: "from-gray-400 to-gray-600",
  };
}
