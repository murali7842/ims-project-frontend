const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export const formatCurrency = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : currencyFormatter.format(value);

// "PARTIALLY_PAID" -> "Partially paid". Tolerates unexpected shapes like ["PAID"].
export const formatEnum = (value: unknown) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === null || raw === undefined || raw === "") return "-";
  const text = String(raw).replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

// "2026-10-08T04:55:27Z" -> "8 Oct 2026"
export const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
};

// API dates are YYYY-MM-DD (sometimes with a time part)
export const toDateInput = (value: string | null | undefined) => (value ? value.slice(0, 10) : "");
