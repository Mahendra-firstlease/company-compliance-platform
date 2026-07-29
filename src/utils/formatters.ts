/**
 * Centralized formatting utilities for currency, dates, file sizes, and phone numbers.
 */

/**
 * Format a number as Indian Rupee (INR) currency.
 * Example: 5000 -> "₹5,000"
 */
export function formatCurrency(
  amount: number | string | undefined | null,
  includeDecimals = false
): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (numericAmount === undefined || numericAmount === null || isNaN(numericAmount)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(numericAmount);
}

/**
 * Format ISO or Date strings into standard Indian English date format.
 * Example: "2026-07-28T00:00:00.000Z" -> "28 Jul 2026"
 */
export function formatDate(
  dateValue: string | Date | undefined | null,
  formatStyle: "short" | "medium" | "full" = "medium"
): string {
  if (!dateValue) return "N/A";

  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  if (isNaN(date.getTime())) return "N/A";

  if (formatStyle === "short") {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  if (formatStyle === "full") {
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format byte count into human readable KB / MB / GB strings.
 * Example: 1048576 -> "1.0 MB"
 */
export function formatFileSize(bytes: number | string | undefined | null): string {
  const numericBytes = typeof bytes === "string" ? parseFloat(bytes) : bytes;

  if (!numericBytes || isNaN(numericBytes) || numericBytes <= 0) {
    return "0 B";
  }

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(numericBytes) / Math.log(k));

  return `${parseFloat((numericBytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Clean and format 10-digit Indian phone numbers with country code prefix.
 * Example: "9876543210" -> "+91 98765 43210"
 */
export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return "N/A";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}
