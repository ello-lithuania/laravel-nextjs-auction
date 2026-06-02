// Auction status values come from the backend in English. Map them to
// Lithuanian for display. Unknown values fall back to the original string.
const STATUS_LABELS: Record<string, string> = {
  "For rent": "Nuomojama",
  "For sale": "Parduodama",
  Live: "Vyksta",
  Featured: "Rekomenduojama",
};

export const statusLabel = (status?: string | null): string =>
  status ? STATUS_LABELS[status] ?? status : "";
