const formatTimeZoneToShortForm = (timeZone: string): string => {
  const timeZoneMap: Record<string, string> = {
    //North America
    "America/New_York": "EST",
    "America/Chicago": "CST",
    "America/Denver": "MST",
    "America/Phoenix": "MST",
    "America/Los_Angeles": "PST",
    "America/Anchorage": "AKST",
    "America/Adak": "HST",
    "Pacific/Honolulu": "HST",

    //Europe
    "Europe/London": "GMT",
    "Europe/Berlin": "CET",
    "Europe/Paris": "CET",
    "Europe/Moscow": "MSK",
    "Europe/Istanbul": "TRT",

    //Asia
    "Asia/Tokyo": "JST",
    "Asia/Shanghai": "CST",
    "Asia/Kolkata": "IST",
    "Asia/Dubai": "GST",
    "Asia/Singapore": "SGT",

    //Australia
    "Australia/Sydney": "AEST",
    "Australia/Adelaide": "ACST",
    "Australia/Darwin": "ACST",
    "Australia/Perth": "AWST",

    //Other
    UTC: "UTC",
    GMT: "GMT",
    "Etc/UTC": "UTC",
    "Etc/GMT": "GMT",
  };

  //Handle daylight saving variants
  const dstMap: Record<string, string> = {
    "America/New_York": "EDT",
    "America/Chicago": "CDT",
    "America/Denver": "MDT",
    "America/Los_Angeles": "PDT",
    "Europe/London": "BST",
    "Europe/Berlin": "CEST",
    "Europe/Paris": "CEST",
    "Australia/Sydney": "AEDT",
    "Australia/Adelaide": "ACDT",
  };

  //Check if timezone is in standard map
  if (timeZoneMap[timeZone]) {
    return timeZoneMap[timeZone];
  }

  //Check if timezone is in DST map (optional - see note below)
  if (dstMap[timeZone]) {
    return dstMap[timeZone];
  }

  //Return empty string for unknown timezones
  return "";
};

export default formatTimeZoneToShortForm;
