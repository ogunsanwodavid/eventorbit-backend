//Format dates to eg "Fri, May 30 2025 11:30am"
const formatDate = (date: Date) => {
  if (!date) return "";

  return date
    .toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/,(\s\d{4})/, "$1") // Remove comma before year
    .replace(/(\d{1,2}):(\d{2})\s(AM|PM)/, "$1:$2$3"); // Remove space before AM/PM
};

export default formatDate;
