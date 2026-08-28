/**
 * Map of country names to their Unicode flag emojis
 */
const countryFlagsMap: Record<string, string> = {
  // Asia
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  China: "🇨🇳",
  Thailand: "🇹🇭",
  Vietnam: "🇻🇳",
  Philippines: "🇵🇭",
  Indonesia: "🇮🇩",
  Malaysia: "🇲🇾",
  Singapore: "🇸🇬",
  Bali: "🇮🇩",
  "Hong Kong": "🇭🇰",
  Taiwan: "🇹🇼",
  India: "🇮🇳",
  Pakistan: "🇵🇰",
  Bangladesh: "🇧🇩",
  Nepal: "🇳🇵",
  "Sri Lanka": "🇱🇰",
  Cambodia: "🇰🇭",
  Laos: "🇱🇦",
  Myanmar: "🇲🇲",

  // Europe
  France: "🇫🇷",
  Italy: "🇮🇹",
  Germany: "🇩🇪",
  Spain: "🇪🇸",
  Portugal: "🇵🇹",
  Greece: "🇬🇷",
  Turkey: "🇹🇷",
  Poland: "🇵🇱",
  "Czech Republic": "🇨🇿",
  Austria: "🇦🇹",
  Switzerland: "🇨🇭",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  Sweden: "🇸🇪",
  Norway: "🇳🇴",
  Denmark: "🇩🇰",
  Finland: "🇫🇮",
  Ireland: "🇮🇪",
  "United Kingdom": "🇬🇧",
  London: "🇬🇧",
  Paris: "🇫🇷",
  Rome: "🇮🇹",
  Barcelona: "🇪🇸",
  Amsterdam: "🇳🇱",
  Venice: "🇮🇹",
  Berlin: "🇩🇪",
  Prague: "🇨🇿",
  Vienna: "🇦🇹",
  Zurich: "🇨🇭",
  Stockholm: "🇸🇪",
  Oslo: "🇳🇴",
  Copenhagen: "🇩🇰",
  Helsinki: "🇫🇮",
  Dublin: "🇮🇪",

  // Americas
  "United States": "🇺🇸",
  USA: "🇺🇸",
  Canada: "🇨🇦",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  Chile: "🇨🇱",
  Peru: "🇵🇪",
  Colombia: "🇨🇴",
  "Costa Rica": "🇨🇷",
  Jamaica: "🇯🇲",
  "New York": "🇺🇸",
  "Los Angeles": "🇺🇸",
  "San Francisco": "🇺🇸",
  Miami: "🇺🇸",
  "Las Vegas": "🇺🇸",
  "New Orleans": "🇺🇸",
  Toronto: "🇨🇦",
  Vancouver: "🇨🇦",
  "Mexico City": "🇲🇽",
  Cancun: "🇲🇽",
  "Rio de Janeiro": "🇧🇷",
  "São Paulo": "🇧🇷",
  "Buenos Aires": "🇦🇷",
  Santiago: "🇨🇱",
  Lima: "🇵🇪",
  Bogotá: "🇨🇴",
  "San José": "🇨🇷",

  // Africa
  Egypt: "🇪🇬",
  Morocco: "🇲🇦",
  Kenya: "🇰🇪",
  Tanzania: "🇹🇿",
  "South Africa": "🇿🇦",
  Nigeria: "🇳🇬",
  Ghana: "🇬🇭",
  Ethiopia: "🇪🇹",
  Rwanda: "🇷🇼",
  Tunisia: "🇹🇳",
  Cairo: "🇪🇬",
  Marrakech: "🇲🇦",
  Casablanca: "🇲🇦",
  Nairobi: "🇰🇪",
  "Cape Town": "🇿🇦",
  Lagos: "🇳🇬",
  Accra: "🇬🇭",
  "Addis Ababa": "🇪🇹",
  Kigali: "🇷🇼",

  // Middle East
  "United Arab Emirates": "🇦🇪",
  Dubai: "🇦🇪",
  "Abu Dhabi": "🇦🇪",
  Qatar: "🇶🇦",
  Doha: "🇶🇦",
  Israel: "🇮🇱",
  "Saudi Arabia": "🇸🇦",
  Jordan: "🇯🇴",

  // Oceania
  Australia: "🇦🇺",
  "New Zealand": "🇳🇿",
  Fiji: "🇫🇯",
  "New South Wales": "🇦🇺",
  Sydney: "🇦🇺",
  Melbourne: "🇦🇺",
  Brisbane: "🇦🇺",
  Perth: "🇦🇺",
  Auckland: "🇳🇿",
  Christchurch: "🇳🇿",
};

/**
 * Get the flag emoji for a destination country
 * @param destination - The destination name or country
 * @returns The flag emoji corresponding to the destination
 */
export function getCountryFlag(destination: string): string {
  if (!destination) return "🌍";

  // Try exact match first
  const exactMatch = countryFlagsMap[destination];
  if (exactMatch) return exactMatch;

  // Try case-insensitive match
  const caseInsensitiveKey = Object.keys(countryFlagsMap).find(
    (key) => key.toLowerCase() === destination.toLowerCase()
  );
  if (caseInsensitiveKey) return countryFlagsMap[caseInsensitiveKey];

  // Try partial match (e.g., "Tokyo" -> Japan)
  const partialMatch = Object.keys(countryFlagsMap).find((key) =>
    destination.toLowerCase().includes(key.toLowerCase())
  );
  if (partialMatch) return countryFlagsMap[partialMatch];

  // Default to world globe
  return "🌍";
}
