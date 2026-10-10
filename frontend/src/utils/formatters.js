export function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function levelClass(level) {
  if (level >= 85) return "critical";
  if (level >= 70) return "high";
  if (level >= 40) return "medium";
  return "low";
}

export function levelLabel(level) {
  if (level >= 85) return "Full";
  if (level >= 70) return "High";
  return level >= 40 ? "Normal" : "Low";
}