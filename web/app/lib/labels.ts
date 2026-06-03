// Auction status values come from the backend in English. Map them to
// Lithuanian for display. Unknown values fall back to the original string.
const STATUS_LABELS: Record<string, string> = {
  "For rent": "Nuomojama",
  "For sale": "Parduodama",
  Live: "Vyksta",
  Featured: "Rekomenduojama",
  Verified: "Patvirtinta",
};

export const statusLabel = (status?: string | null): string =>
  status ? STATUS_LABELS[status] ?? status : "";

// Semantinė badge spalva — kiekvienas statusas turi SAVO spalvą (ne visi pilki).
// Grąžina Tailwind klases chunky badge'ui (fonas + tekstas).
export type StatusTone = { bg: string; text: string };

const STATUS_TONES: Record<string, StatusTone> = {
  Live: { bg: "bg-green", text: "text-white" }, // Vyksta
  Featured: { bg: "bg-gold", text: "text-ink" }, // Rekomenduojama
  Verified: { bg: "bg-ink", text: "text-cream" }, // Patvirtinta
  "For sale": { bg: "bg-paper", text: "text-ink" }, // Parduodama
  "For rent": { bg: "bg-red", text: "text-white" }, // Nuomojama
};

export const statusTone = (status?: string | null): StatusTone =>
  (status && STATUS_TONES[status]) || { bg: "bg-paper", text: "text-ink" };
