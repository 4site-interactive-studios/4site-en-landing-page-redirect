/* Engaging Networks Homepage Takeover Redirect Script

Source Code: https://github.com/4site-interactive-studios/4site-en-landing-page-redirect/blob/main/landing-page-gtm-tag.js

This script manages time-based redirections for specific dates on landing pages. It checks the current date and, if it matches a target date, redirects users to a designated Engaging Networks page URL for that day. The script also includes a suppression feature: it sets a cookie to prevent multiple redirects within a 24-hour period and allows users to opt out of redirection by adding a 'no-redirect' parameter to the URL. Additionally, any query parameters from the original URL are preserved and passed along to the redirect destination.
*/

// ============================================================================
// CONFIGURATION
// ============================================================================
// Configure the dates and corresponding Engaging Networks page URLs
// Date formats: "MM-DD" (e.g., "12-03" for December 3rd, matches every year)
//               or "MM-DD-YYYY" (e.g., "12-03-2024" for December 3rd, 2024, matches specific year)
// Include any necessary URL parameters such as tracking codes in the URLs
const urlsByDate = {
  "12-03":
    "https://support.yourorganization.org/page/12345/donate/1?transaction.othamt1=TRACKINGCODE",
  "12-30":
    "https://support.yourorganization.org/page/12345/donate/1?transaction.othamt1=TRACKINGCODE",
  "12-31":
    "https://support.yourorganization.org/page/12345/donate/1?transaction.othamt1=TRACKINGCODE",
};

// Cookie name used to suppress redirects (prevents multiple redirects within 24 hours)
const suppressionCookie = "redirectSuppressed";

// Cookie suppression duration in days
const SUPPRESSION_DURATION_DAYS = 1;

// Milliseconds per day constant
const MS_PER_DAY = 24 * 60 * 60 * 1000;
// ============================================================================

(function () {
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

  // Set a cookie with expiration date (specified in days)
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * MS_PER_DAY);
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + "; " + expires + "; path=/";
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

  // Validate that a date string in MM-DD or MM-DD-YYYY format represents a valid date
  function isValidDate(dateStr) {
    const parts = dateStr.split("-");
    if (parts.length !== 2 && parts.length !== 3) return false;

    const month = Number(parts[0]);
    const day = Number(parts[1]);
    const year = parts.length === 3 ? Number(parts[2]) : null;

    if (month < 1 || month > 12 || day < 1 || day > 31) return false;
    if (year !== null && (year < 1000 || year > 9999)) return false;

    // Create a date object to validate
    const validationYear = year || 2000; // Use provided year or 2000 as baseline
    const date = new Date(validationYear, month - 1, day);
    return (
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      (year === null || date.getFullYear() === year)
    );
  }

  // Normalize date string to MM-DD format (removes year if present)
  function normalizeDate(dateStr) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return parts[0] + "-" + parts[1]; // Return MM-DD from MM-DD-YYYY
    }
    return dateStr; // Already in MM-DD format
  }

  // Get current date in MM-DD format, or use simulated date from query parameter for testing
  // Allows testing redirects on any date using ?simulate-date=MM-DD or ?simulate-date=MM-DD-YYYY
  function getCurrentOrSimulatedDate() {
    const simulateDate = queryParams.get("simulate-date");
    if (
      simulateDate &&
      (/^\d{2}-\d{2}$/.test(simulateDate) ||
        /^\d{2}-\d{2}-\d{4}$/.test(simulateDate)) &&
      isValidDate(simulateDate)
    ) {
      // Normalize to MM-DD format for comparison
      return normalizeDate(simulateDate);
    }
    const today = new Date();
    return (
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")
    );
  }

  // Get current date in MM-DD-YYYY format for year-specific matching
  function getCurrentDateWithYear() {
    const today = new Date();
    return (
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0") +
      "-" +
      String(today.getFullYear())
    );
  }

  // Check if today's date matches a configured redirect date
  const todayFormatted = getCurrentOrSimulatedDate(); // MM-DD format
  const todayWithYear = getCurrentDateWithYear(); // MM-DD-YYYY format

  // Check for exact year-specific match first, then fall back to year-agnostic match
  const redirectUrl = urlsByDate[todayWithYear] || urlsByDate[todayFormatted];

  if (redirectUrl) {
    // Set suppression cookie before redirecting to prevent redirect loops
    setCookie(suppressionCookie, "true", SUPPRESSION_DURATION_DAYS);

    // Redirect to the configured Engaging Networks page for this date
    window.location.href = buildRedirectUrl(redirectUrl);
  }
})();
