/* Engaging Networks Homepage Takeover Redirect Script

Source Code: https://github.com/4site-interactive-studios/4site-en-landing-page-redirect/blob/main/landing-page-script.js

This script manages time-based redirections for specific dates on landing pages. It checks the current date and, if it matches a target date, redirects users to a designated Engaging Networks page URL for that day. The script also includes a suppression feature: it sets a cookie to prevent multiple redirects within a 24-hour period and allows users to opt out of redirection by adding a 'no-redirect' parameter to the URL. Additionally, any query parameters from the original URL are preserved and passed along to the redirect destination.

CONFIGURATION:
This script requires a configuration object to be defined before it loads:
  window.landingPageRedirectConfig = {
    urlsByDate: { ... },              // Object mapping dates to redirect URLs
    suppressionCookie: "redirectSuppressed",  // Cookie name (optional, defaults shown)
    suppressionDurationDays: 1        // Suppression duration in days (optional, defaults shown)
  };
*/

(function () {
  // Check for configuration object
  if (!window.landingPageRedirectConfig) {
    console.error(
      "landing-page-script.js: Configuration object 'window.landingPageRedirectConfig' is required but not found."
    );
    return;
  }

  const config = window.landingPageRedirectConfig;

  // Validate required configuration
  if (!config.urlsByDate || typeof config.urlsByDate !== "object") {
    console.error(
      "landing-page-script.js: 'urlsByDate' object is required in configuration."
    );
    return;
  }

  // Check if urlsByDate is empty - if so, exit gracefully without doing anything
  const urlsByDate = config.urlsByDate;
  if (Object.keys(urlsByDate).length === 0) {
    // No dates configured, exit silently
    return;
  }

  // Set defaults for optional configuration (fallback values)
  const suppressionCookie = config.suppressionCookie || "redirectSuppressed";
  const SUPPRESSION_DURATION_DAYS =
    config.suppressionDurationDays !== undefined
      ? config.suppressionDurationDays
      : 1;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  const queryParams = new URLSearchParams(window.location.search);

  // Get cookie by name (proper parsing to avoid false positives)
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let c of ca) {
      while (c.charAt(0) === " ") c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  }

  // Set a cookie with expiration date (specified in days) and security attributes
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * MS_PER_DAY);
    const expires = "expires=" + date.toUTCString();
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      name + "=" + value + "; " + expires + "; path=/; SameSite=Lax" + secure;
  }

  // If no-redirect parameter is present, set suppression cookie and exit
  // This allows users to opt out of redirects
  if (queryParams.has("no-redirect")) {
    setCookie(suppressionCookie, "true", SUPPRESSION_DURATION_DAYS);
    return;
  }

  // Check if suppression cookie exists (user has already been redirected or opted out)
  if (getCookie(suppressionCookie)) {
    return; // Exit early - suppression is active
  }

  // Validate that a URL string is valid and uses http/https protocol
  function isValidUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  // Build redirect URL by appending original query parameters and tracking flags
  // Preserves all original URL parameters and adds was-redirected and originating-url flags
  function buildRedirectUrl(redirectUrl) {
    try {
      const redirectParams = new URLSearchParams(queryParams.toString());
      redirectParams.append("was-redirected", "");
      redirectParams.append("originating-url", window.location.href);
      const separator = redirectUrl.indexOf("?") === -1 ? "?" : "&";
      return redirectUrl + separator + redirectParams.toString();
    } catch (e) {
      // If URL building fails, return the base redirect URL
      console.error("Error building redirect URL:", e);
      return redirectUrl;
    }
  }

  // Validate that a date string is in YYYY-MM-DD format and represents a valid date
  function isValidDate(dateStr) {
    // Must match YYYY-MM-DD format exactly
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

    const parts = dateStr.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (year < 1000 || year > 9999) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    // Create a date object to validate the date is actually valid
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  // Get current date in YYYY-MM-DD format, or use simulated date from query parameter for testing
  // Allows testing redirects on any date using ?simulate-date=YYYY-MM-DD
  function getCurrentDate() {
    const simulateDate = queryParams.get("simulate-date");
    if (
      simulateDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(simulateDate) &&
      isValidDate(simulateDate)
    ) {
      return simulateDate;
    }
    // Otherwise use actual current date
    const today = new Date();
    return (
      String(today.getFullYear()) +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")
    );
  }

  // Check if today's date matches a configured redirect date
  const todayFormatted = getCurrentDate(); // YYYY-MM-DD format

  // Debug logging (can be removed in production)
  console.log("Redirect script - Checking dates:", {
    todayFormatted,
    configuredDates: Object.keys(urlsByDate),
  });

  // Check for exact date match
  const redirectUrl = urlsByDate[todayFormatted];

  if (redirectUrl) {
    // Validate URL before redirecting
    if (!isValidUrl(redirectUrl)) {
      console.error(
        "Redirect script - Invalid redirect URL configured:",
        redirectUrl
      );
      return;
    }

    console.log("Redirect script - Match found! Redirecting to:", redirectUrl);
    // Set suppression cookie before redirecting to prevent redirect loops
    setCookie(suppressionCookie, "true", SUPPRESSION_DURATION_DAYS);

    // Redirect to the configured Engaging Networks page for this date
    window.location.href = buildRedirectUrl(redirectUrl);
  } else {
    console.log("Redirect script - No match found for current date");
  }
})();
