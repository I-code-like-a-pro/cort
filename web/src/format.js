export function fmt(n) {
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function timeOf(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function isTxHash(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
}
