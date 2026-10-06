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

// API dates are YYYY-MM-DD (sometimes with a time part)
export const toDateInput = (value: string | null | undefined) => (value ? value.slice(0, 10) : "");
