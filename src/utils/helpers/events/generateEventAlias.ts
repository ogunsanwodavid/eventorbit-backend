export function generateEventAlias(inputString: string): string {
  const cleanStr = inputString
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  // Generate 6-char suffix from timestamp + random
  const suffix =
    Date.now()
      .toString(36) // Base36 conversion
      .slice(-3) // Last 3 chars (time-based)
      .toUpperCase() +
    Math.random()
      .toString(36)
      .slice(2, 5) // 3 random chars
      .toUpperCase();

  return `${cleanStr}-${suffix}`; // e.g. "tech-conf-A7F9B2"
}
